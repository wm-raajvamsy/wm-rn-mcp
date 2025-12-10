#!/usr/bin/env node

import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions, handleToolCall } from "./tools/tools.js";
import type { Request, Response } from "express";

const MCP_PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3100;

// Create MCP server instance ONCE (not per request!)
const server = new McpServer({
  name: "wavemaker-rn-mcp",
  version: "1.0.0",
});

// Register tools using tool() API with Zod schemas
console.log(`🔧 Registering ${toolDefinitions.length} MCP tools...`);

toolDefinitions.forEach(toolDef => {
  server.tool(
    toolDef.name as string,
    toolDef.inputSchema as any, // Zod schema object (ZodRawShape)
    {
      description: toolDef.description as string
    },
    async (args: any, extra: any) => {
      try {
        console.log(`[TOOL] Executing: ${toolDef.name}`);
        console.log(`[TOOL] Args:`, JSON.stringify(args));
        
        // Pass extra (RequestHandlerExtra) to handleToolCall for context
        const result = await handleToolCall(toolDef.name as string, args, extra);
        
        console.log(`[TOOL] Result:`, JSON.stringify(result).substring(0, 200));
        return result as any; // Cast to bypass strict type checking
      } catch (error) {
        console.error(`[TOOL ERROR] Tool: ${toolDef.name}`);
        console.error(`[TOOL ERROR] Error:`, error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        } as any;
      }
    }
  );
});

// Map to store transports by session ID
const transports = new Map<string, StreamableHTTPServerTransport>();

// Create Express app 
const app = express();
app.use(express.json());

// POST /mcp - Handle JSON-RPC messages
app.post('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId) {
    console.log(`Received MCP request for session: ${sessionId}`);
  } else {
    console.log('Received MCP request (no session)');
  }

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      // Reuse existing transport for this session
      transport = transports.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request - create transport with session
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          console.log(`Session initialized: ${sid}`);
          transports.set(sid, transport);
        },
        onsessionclosed: (sid) => {
          console.log(`Session closed: ${sid}`);
          transports.delete(sid);
        }
      });

      // Setup cleanup on transport close
      transport.onclose = () => {
        if (transport.sessionId) {
          console.log(`Transport closed for session ${transport.sessionId}`);
          transports.delete(transport.sessionId);
        }
      };

      // Connect existing server to new transport
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return; // Request already handled
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: '2.0',
        error: { 
          code: -32000, 
          message: 'Bad Request: No valid session ID provided or not an initialization request' 
        },
        id: null
      });
      return;
    }

    // Handle request with existing transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { 
          code: -32603, 
          message: 'Internal server error' 
        },
        id: null
      });
    }
  }
});

// GET /mcp - Handle SSE streams
app.get('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const lastEventId = req.headers['last-event-id'];
  if (lastEventId) {
    console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
  } else {
    console.log(`Establishing new SSE stream for session ${sessionId}`);
  }

  const transport = transports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// DELETE /mcp - Terminate session
app.delete('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Received session termination request for session ${sessionId}`);

  try {
    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
});

// Start server
app.listen(MCP_PORT, () => {
  console.log(`WaveMaker RN MCP HTTP Server running on http://127.0.0.1:${MCP_PORT}/mcp`);
  console.log(`Server name: wavemaker-rn-mcp`);
  console.log(`Version: 1.0.0`);
  console.log(`Transport: Streamable HTTP (MCP Spec 2025-03-26)`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  
  // Close all active transports
  for (const [sessionId, transport] of transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transport.close();
      transports.delete(sessionId);
    } catch (error) {
      console.error(`Error closing session ${sessionId}:`, error);
    }
  }
  
  console.log('Server shutdown complete');
  process.exit(0);
});

