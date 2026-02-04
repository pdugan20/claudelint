/**
 * Tests for MCP configuration schema
 */

import {
  MCPConfigSchema,
  MCPStdioTransportSchema,
  MCPHTTPTransportSchema,
  MCPSSETransportSchema,
  MCPWebSocketTransportSchema,
} from '../../src/validators/schemas';

describe('MCPConfigSchema', () => {
  describe('valid configurations', () => {
    it('should accept valid MCP config with stdio server', () => {
      const result = MCPConfigSchema.safeParse({
        mcpServers: {
          myServer: {
            command: 'node',
            args: ['server.js'],
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty mcpServers object', () => {
      const result = MCPConfigSchema.safeParse({
        mcpServers: {},
      });
      expect(result.success).toBe(true);
    });

    it('should require mcpServers field', () => {
      const result = MCPConfigSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('multiple server types', () => {
    it('should accept mix of different transport types', () => {
      const result = MCPConfigSchema.safeParse({
        mcpServers: {
          stdioServer: {
            type: 'stdio',
            command: 'node',
            args: ['server.js'],
          },
          httpServer: {
            type: 'http',
            url: 'http://localhost:3000',
          },
          wsServer: {
            type: 'websocket',
            url: 'ws://localhost:3001',
          },
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('MCPStdioTransportSchema', () => {
  describe('required fields', () => {
    it('should require command field', () => {
      const result = MCPStdioTransportSchema.safeParse({
        type: 'stdio',
      });
      expect(result.success).toBe(false);
    });

    it('should accept minimal stdio config', () => {
      const result = MCPStdioTransportSchema.safeParse({
        command: 'node',
      });
      expect(result.success).toBe(true);
    });

    it('should accept stdio with explicit type', () => {
      const result = MCPStdioTransportSchema.safeParse({
        type: 'stdio',
        command: 'node',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept args array', () => {
      const result = MCPStdioTransportSchema.safeParse({
        command: 'node',
        args: ['server.js', '--port', '3000'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty args array', () => {
      const result = MCPStdioTransportSchema.safeParse({
        command: 'node',
        args: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept env object', () => {
      const result = MCPStdioTransportSchema.safeParse({
        command: 'node',
        env: {
          NODE_ENV: 'production',
          API_KEY: 'secret',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept all fields', () => {
      const result = MCPStdioTransportSchema.safeParse({
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        env: {
          DEBUG: 'mcp:*',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('MCPHTTPTransportSchema', () => {
  describe('required fields', () => {
    it('should require type field', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        url: 'http://localhost:3000',
      });
      expect(result.success).toBe(false);
    });

    it('should require url field', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        type: 'http',
      });
      expect(result.success).toBe(false);
    });

    it('should accept minimal HTTP config', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        type: 'http',
        url: 'http://localhost:3000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept headers object', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        type: 'http',
        url: 'http://localhost:3000',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept env object', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        type: 'http',
        url: 'http://localhost:3000',
        env: {
          API_KEY: 'secret',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept all fields', () => {
      const result = MCPHTTPTransportSchema.safeParse({
        type: 'http',
        url: 'https://api.example.com/mcp',
        headers: {
          Authorization: 'Bearer token',
        },
        env: {
          API_URL: 'https://api.example.com',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('MCPSSETransportSchema', () => {
  describe('required fields', () => {
    it('should require type field', () => {
      const result = MCPSSETransportSchema.safeParse({
        url: 'https://api.example.com/sse',
      });
      expect(result.success).toBe(false);
    });

    it('should require url field', () => {
      const result = MCPSSETransportSchema.safeParse({
        type: 'sse',
      });
      expect(result.success).toBe(false);
    });

    it('should accept minimal SSE config', () => {
      const result = MCPSSETransportSchema.safeParse({
        type: 'sse',
        url: 'https://api.example.com/sse',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept headers object', () => {
      const result = MCPSSETransportSchema.safeParse({
        type: 'sse',
        url: 'https://api.example.com/sse',
        headers: {
          Authorization: 'Bearer token',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept env object', () => {
      const result = MCPSSETransportSchema.safeParse({
        type: 'sse',
        url: 'https://api.example.com/sse',
        env: {
          API_KEY: 'secret',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept all fields', () => {
      const result = MCPSSETransportSchema.safeParse({
        type: 'sse',
        url: 'https://api.example.com/events',
        headers: {
          Authorization: 'Bearer token',
          'X-API-Key': 'key123',
        },
        env: {
          DEBUG: 'true',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('MCPWebSocketTransportSchema', () => {
  describe('required fields', () => {
    it('should require type field', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        url: 'ws://localhost:3001',
      });
      expect(result.success).toBe(false);
    });

    it('should require url field', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        type: 'websocket',
      });
      expect(result.success).toBe(false);
    });

    it('should accept minimal WebSocket config', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        type: 'websocket',
        url: 'ws://localhost:3001',
      });
      expect(result.success).toBe(true);
    });

    it('should accept wss:// protocol', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        type: 'websocket',
        url: 'wss://api.example.com/ws',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept env object', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        type: 'websocket',
        url: 'ws://localhost:3001',
        env: {
          WS_TOKEN: 'secret',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept all fields', () => {
      const result = MCPWebSocketTransportSchema.safeParse({
        type: 'websocket',
        url: 'wss://api.example.com/mcp',
        env: {
          API_KEY: 'secret',
          DEBUG: 'mcp:*',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('Server type discrimination', () => {
  it('should distinguish between transport types', () => {
    const stdioResult = MCPStdioTransportSchema.safeParse({
      command: 'node',
    });
    const httpResult = MCPHTTPTransportSchema.safeParse({
      command: 'node',
    });

    expect(stdioResult.success).toBe(true);
    expect(httpResult.success).toBe(false);
  });

  it('should validate server in mcpServers context', () => {
    const result = MCPConfigSchema.safeParse({
      mcpServers: {
        valid: {
          type: 'http',
          url: 'http://localhost:3000',
        },
        invalid: {
          type: 'http',
          // missing url
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
