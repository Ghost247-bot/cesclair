# TestSprite MCP – Log messages and workarounds

The messages you see in **Cursor MCP logs** (e.g. `anysphere.cursor-mcp.MCP user-TestSprite`) come from **Cursor’s MCP client**, not from this repo. They are timing/race issues between Cursor and the TestSprite MCP server.

## What the log messages mean

| Log message | Cause |
|------------|--------|
| **"No server info found"** | Cursor called `GetInstructions` before the TestSprite server was ready. |
| **"Server not yet created, returning empty offerings"** | Cursor called `ListOfferings` before `CreateClient` had finished starting the server. |
| **"Received a response for an unknown message ID"** | The server replied (e.g. with `id: 0`) but the client had already timed out or dropped that request. |

So the server eventually starts (e.g. “Successfully connected to stdio server”, “listOfferings: Found 8 tools”), but the first few requests can fail because they run before the server is ready.

## What we did in this project

- **`.cursor/mcp.json`** – Project-level MCP config so Cursor starts the TestSprite server with a fixed command (`npx -y @testsprite/testsprite-mcp@latest`). This can make startup more predictable.

## What you can do (workarounds)

1. **Use TestSprite after it’s connected**  
   Wait until you see “Successfully connected to stdio server” / “CreateClient completed, server stored: true” in the logs before using TestSprite tools.

2. **Restart the MCP server**  
   In Cursor: **Settings → Features → MCP**, find TestSprite and restart it. Then try the action again.

3. **Retry once**  
   If you get “No server info found” or “Server not yet created”, retry the same action; it often works after the server has finished starting.

4. **Update Cursor**  
   These races are in Cursor’s MCP client; newer Cursor versions may improve ordering (CreateClient before ListOfferings/GetInstructions) and message ID handling.

## What can’t be fixed in this repo

The **“No server info found”**, **“Server not yet created”**, and **“unknown message ID”** behavior is in Cursor’s MCP layer, not in your application code. Fixes have to come from Cursor/TestSprite MCP client updates; the project config and this doc only help with reliable startup and understanding the logs.
