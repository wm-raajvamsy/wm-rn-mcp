#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions, handleToolCall } from "./tools/tools.js";
import { zodToJsonSchema } from "zod-to-json-schema";

// Create an MCP server
const server = new Server(
  {
    name: "wavemaker-rn-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions.map(tool => {
      try {
        const jsonSchema: any = zodToJsonSchema(tool.inputSchema as any, { 
          target: 'jsonSchema7',
          $refStrategy: 'none'
        });
        
        // Ensure type is set to 'object' at root level
        if (!jsonSchema.type) {
          jsonSchema.type = 'object';
        }
        
        return {
          name: tool.name,
          description: tool.description,
          inputSchema: jsonSchema,
        };
      } catch (error) {
        console.error(`Error converting schema for tool ${tool.name}:`, error);
        // Fallback to basic schema
        return {
          name: tool.name,
          description: tool.description,
          inputSchema: {
            type: 'object',
            properties: {},
          },
        };
      }
    }),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(name, args);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WaveMaker RN MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
