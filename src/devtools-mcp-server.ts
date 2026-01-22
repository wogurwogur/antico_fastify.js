import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const DEFAULT_BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";

/** 안전한 JSON 파서 */
function tryJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

/** URL 조합: path만 주면 baseUrl 붙임, 절대 URL이면 그대로 사용 */
function resolveUrl(baseUrl: string, urlOrPath: string) {
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  return `${base}${path}`;
}

/** 쿼리 파라미터 추가 */
function withQuery(url: string, queryObj: any) {
  if (!queryObj || Object.keys(queryObj).length === 0) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(queryObj)) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

/** fetch 공통 */
async function httpRequest({ baseUrl, method, urlOrPath, query, headers, body, timeoutMs }: any) {
  const url = withQuery(resolveUrl(baseUrl, urlOrPath), query);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort("timeout"), timeoutMs);

  const init: any = {
    method,
    headers: headers ?? {},
    signal: controller.signal,
  };

  if (body !== undefined && body !== null) {
    init.body = body;
  }

  const startedAt = Date.now();
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    const json = tryJson(text);

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      url,
      elapsedMs: Date.now() - startedAt,
      headers: Object.fromEntries(res.headers.entries()),
      bodyText: text,
      bodyJson: json,
    };
  } finally {
    clearTimeout(t);
  }
}

class ApiMcpServer {
  server: any;

  constructor() {
    this.server = new McpServer({
      name: "api-test-mcp-server",
      version: "1.0.0",
    });
    this.setupTools();
  }

  setupTools() {
    // 1) GET 호출
    this.server.registerTool(
      "api_get",
      {
        title: "API GET",
        description: "Send a GET request to Fastify (default baseUrl: http://127.0.0.1:3000). Returns status, headers, body.",
        inputSchema: z.object({
          baseUrl: z.string().optional().default(DEFAULT_BASE_URL),
          urlOrPath: z.string().min(1), // "/api/notice/list" 또는 "http://..."
          query: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
          headers: z.record(z.string()).optional(),
          timeoutMs: z.number().int().min(500).max(60000).optional().default(10000),
        }),
      },
      async ({ baseUrl, urlOrPath, query, headers, timeoutMs }) => {
        const result = await httpRequest({
          baseUrl,
          method: "GET",
          urlOrPath,
          query,
          headers,
          body: undefined,
          timeoutMs,
        });

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    // 2) POST 호출 (json / form / text)
    this.server.registerTool(
      "api_post",
      {
        title: "API POST",
        description: "Send a POST request. Supports json/form/text body types.",
        inputSchema: z.object({
          baseUrl: z.string().optional().default(DEFAULT_BASE_URL),
          urlOrPath: z.string().min(1),
          headers: z.record(z.string()).optional(),
          bodyType: z.enum(["json", "form", "text"]).optional().default("json"),
          // json이면 jsonBody 사용, form이면 formBody(키-값), text면 textBody
          jsonBody: z.any().optional(),
          formBody: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
          textBody: z.string().optional(),
          timeoutMs: z.number().int().min(500).max(60000).optional().default(10000),
        }),
      },
      async ({ baseUrl, urlOrPath, headers, bodyType, jsonBody, formBody, textBody, timeoutMs }) => {
        const h = { ...(headers ?? {}) };
        let body;

        if (bodyType === "json") {
          h["Content-Type"] ??= "application/json; charset=utf-8";
          body = JSON.stringify(jsonBody ?? {});
        } else if (bodyType === "form") {
          h["Content-Type"] ??= "application/x-www-form-urlencoded; charset=utf-8";
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(formBody ?? {})) params.set(k, String(v));
          body = params.toString();
        } else {
          h["Content-Type"] ??= "text/plain; charset=utf-8";
          body = textBody ?? "";
        }

        const result = await httpRequest({
          baseUrl,
          method: "POST",
          urlOrPath,
          query: undefined,
          headers: h,
          body,
          timeoutMs,
        });

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    // 3) 스모크 테스트 (여러 엔드포인트 한 번에)
    this.server.registerTool(
      "api_smoke_test",
      {
        title: "API Smoke Test",
        description: "Run quick checks against a list of endpoints. Good for '서버 살아있나' 및 기본 API 동작 확인.",
        inputSchema: z.object({
          baseUrl: z.string().optional().default(DEFAULT_BASE_URL),
          // 예: [{method:"GET", path:"/health", expectStatus:200}, ...]
          tests: z.array(
            z.object({
              method: z.enum(["GET", "POST"]).default("GET"),
              urlOrPath: z.string().min(1),
              expectStatus: z.number().int().optional(),
              // POST일 때만
              bodyType: z.enum(["json", "form", "text"]).optional().default("json"),
              jsonBody: z.any().optional(),
              formBody: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
              textBody: z.string().optional(),
              headers: z.record(z.string()).optional(),
              timeoutMs: z.number().int().min(500).max(60000).optional().default(10000),
            })
          ).optional().default([
            { method: "GET", urlOrPath: "/health", expectStatus: 200 },
          ]),
        }),
      },
      async ({ baseUrl, tests }) => {
        const results = [];
        for (const t of tests) {
          const method = t.method ?? "GET";
          const timeoutMs = t.timeoutMs ?? 10000;

          if (method === "GET") {
            const r = await httpRequest({
              baseUrl,
              method: "GET",
              urlOrPath: t.urlOrPath,
              query: undefined,
              headers: t.headers,
              body: undefined,
              timeoutMs,
            });
            results.push({
              test: t,
              pass: typeof t.expectStatus === "number" ? r.status === t.expectStatus : r.ok,
              result: r,
            });
          } else {
            const h = { ...(t.headers ?? {}) };
            let body;

            if (t.bodyType === "json") {
              h["Content-Type"] ??= "application/json; charset=utf-8";
              body = JSON.stringify(t.jsonBody ?? {});
            } else if (t.bodyType === "form") {
              h["Content-Type"] ??= "application/x-www-form-urlencoded; charset=utf-8";
              const params = new URLSearchParams();
              for (const [k, v] of Object.entries(t.formBody ?? {})) params.set(k, String(v));
              body = params.toString();
            } else {
              h["Content-Type"] ??= "text/plain; charset=utf-8";
              body = t.textBody ?? "";
            }

            const r = await httpRequest({
              baseUrl,
              method: "POST",
              urlOrPath: t.urlOrPath,
              query: undefined,
              headers: h,
              body,
              timeoutMs,
            });

            results.push({
              test: t,
              pass: typeof t.expectStatus === "number" ? r.status === t.expectStatus : r.ok,
              result: r,
            });
          }
        }

        const summary = {
          baseUrl,
          total: results.length,
          passed: results.filter((x) => x.pass).length,
          failed: results.filter((x) => !x.pass).length,
          results,
        };

        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`API Test MCP Server running... (baseUrl default: ${DEFAULT_BASE_URL})`);
  }
}

const server = new ApiMcpServer();
server.run().catch((e) => console.error(e));
