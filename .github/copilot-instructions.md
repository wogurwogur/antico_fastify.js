# Copilot Instructions for Antico Codebase

## Overview
This document provides essential guidelines for AI coding agents to effectively navigate and contribute to the Antico codebase. Understanding the architecture, workflows, and conventions is crucial for productivity.

## Architecture
- **Main Components**: The application is built using Fastify, with a clear separation of concerns across routes, services, and repositories.
- **Data Flow**: Requests are routed through `src/routes/index.js`, which delegates to specific route handlers (e.g., `notice.routes.js`). Services (e.g., `notice.service.js`) handle business logic, while repositories (e.g., `notice.repository.js`) interact with the database.
- **Why This Structure**: This modular approach enhances maintainability and scalability, allowing for easier updates and testing.

## Developer Workflows
- **Running the Application**: Use `nodemon` for development to automatically restart the server on file changes.
- **Testing**: Ensure to write tests for each service and route. Use Playwright for end-to-end testing.
- **Debugging**: Utilize console logging and Fastify's built-in logger for debugging.

## Project-Specific Conventions
- **Naming Conventions**: Use camelCase for function names and PascalCase for class names. File names should reflect their content (e.g., `notice.routes.js` for notice-related routes).
- **Error Handling**: Implement centralized error handling in Fastify to manage errors gracefully across the application.

## Integration Points
- **External Dependencies**: The project relies on several key dependencies, including Fastify for the server framework, MySQL for the database, and Zod for schema validation.
- **Cross-Component Communication**: Services communicate with repositories to fetch or manipulate data, ensuring a clear boundary between data access and business logic.

## Key Files/Directories
- **Main Application**: [src/app.js](src/app.js) - Entry point for the Fastify application.
- **Routes**: [src/routes/index.js](src/routes/index.js) - Central routing configuration.
- **Services**: [src/services/notice.service.js](src/services/notice.service.js) - Business logic for notice management.
- **Repositories**: [src/repositories/notice.repository.js](src/repositories/notice.repository.js) - Database interactions for notices.

## Conclusion
This document serves as a foundational guide for AI agents working within the Antico codebase. For further details, refer to the specific files mentioned above and adhere to the outlined conventions and workflows.