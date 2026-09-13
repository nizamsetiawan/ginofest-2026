---
name: composio
description: Route and complete Composio work across Composio For You and Composio Platform. Use when the user mentions Composio; wants an agent to use apps such as Gmail, Slack, GitHub, Notion, Calendar, or Linear; needs first-time setup, an SDK or MCP integration, CLI operation, migration guidance, current documentation, or help diagnosing a connection or tool call.
---

# Composio

Use this skill as a router. Identify the product and the job, load only the relevant guidance, consult canonical documentation for volatile details, and then answer or do the work the user requested.

## 1. Choose the product

Do not blend the products. They use different credentials and setup paths.

| | Composio For You | Composio Platform |
|---|---|---|
| Use when | Someone wants their own agent to use their own apps | A developer is building a product whose users connect accounts |
| Primary surface | MCP or the Composio CLI | SDK sessions inside an application |
| Credential | `ck_...` consumer key when the client requires a header | `COMPOSIO_API_KEY` project key |
| Dashboard | `dashboard.composio.dev` → For You | `dashboard.composio.dev` → Platform |

Ask one short question only when context does not establish the product:

> Is this for your own agent and accounts, or for a product where your users connect their accounts?

Treat a named personal AI client with no product code as For You. Treat an application codebase, SDK, user or tenant identity, backend, or product agent as Platform.

## 2. Choose the job

Identify the requested outcome before taking action:

- **Explain or discover:** answer a question, compare approaches, or find the current API.
- **Set up:** establish credentials, an MCP client, the CLI, or an SDK for the first time.
- **Build or change:** integrate Composio into an existing agent or application.
- **Operate:** find, connect, and run tools for a real task.
- **Debug or migrate:** diagnose a failure, update an older integration, or move from legacy direct execution or Tool Router.

Do not turn an explanation, documentation lookup, or narrow bug fix into onboarding.

## 3. Load only the relevant guidance

- For You: read [Composio For You](references/for-you.md).
- Platform: read [Composio Platform](references/platform.md).
- Provider, connection, or execution failure: also read [Errors and provider gotchas](references/errors.md).

## Complete the selected job

- For a question, fetch current documentation when needed and give the concrete answer. Do not mutate a project or force a tool call.
- For setup or integration, inspect the existing environment, preserve its architecture and identity model, make the smallest useful change, and verify it with one safe real tool call when credentials and user authorization are available.
