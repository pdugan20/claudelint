# Rule: mcp-server-key-mismatch

**Severity**: Warning
**Fixable**: No
**Validator**: MCP
**Category**: Best Practices

Server object key should match server name property for clarity

## Rule Details

When configuring MCP servers, the object key should match the server's name property. While technically not required by the MCP specification, mismatches reduce clarity, make configuration harder to search and maintain, and can cause confusion when debugging server issues.

This is a warning-level rule because mismatched keys don't break functionality, but matching them significantly improves code maintainability and team collaboration.

### Incorrect

Server key doesn't match name property:

```json
{
  "mcpServers": {
    "database-tools": {
      "name": "db-tools",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["db_server.py"]
      }
    }
  }
}
```

Multiple servers with mismatched keys:

```json
{
  "mcpServers": {
    "serverKey1": {
      "name": "tools-server",
      "transport": {
        "type": "stdio",
        "command": "node tools.js"
      }
    },
    "serverKey2": {
      "name": "api-server",
      "transport": {
        "type": "http",
        "url": "http://localhost:8080"
      }
    }
  }
}
```

Case sensitivity matters:

```json
{
  "mcpServers": {
    "myserver": {
      "name": "MyServer",
      "transport": {
        "type": "stdio",
        "command": "node server.js"
      }
    }
  }
}
```

### Correct

Server key matches name property:

```json
{
  "mcpServers": {
    "db-tools": {
      "name": "db-tools",
      "transport": {
        "type": "stdio",
        "command": "python",
        "args": ["db_server.py"]
      }
    }
  }
}
```

Multiple servers with matching keys:

```json
{
  "mcpServers": {
    "tools-server": {
      "name": "tools-server",
      "transport": {
        "type": "stdio",
        "command": "node tools.js"
      }
    },
    "api-server": {
      "name": "api-server",
      "transport": {
        "type": "http",
        "url": "http://localhost:8080"
      }
    }
  }
}
```

Server without name property (no validation needed):

```json
{
  "mcpServers": {
    "local-tools": {
      "transport": {
        "type": "stdio",
        "command": "node",
        "args": ["./servers/tools.js"]
      }
    }
  }
}
```

## How To Fix

To resolve key-name mismatches:

1. **Identify mismatches** in .mcp.json:

   ```bash
   # Check for key-name mismatches
   cat .mcp.json | jq '.mcpServers | to_entries | map(select(.key != .value.name)) | .[].key'
   ```

2. **Update the object key** to match the name:

   ```json
   # Before
   {
     "mcpServers": {
       "database-tools": {
         "name": "db-tools"
       }
     }
   }

   # After
   {
     "mcpServers": {
       "db-tools": {
         "name": "db-tools"
       }
     }
   }
   ```

3. **Or update the name** to match the key:

   ```json
   # Before
   {
     "mcpServers": {
       "database-tools": {
         "name": "db-tools"
       }
     }
   }

   # After
   {
     "mcpServers": {
       "database-tools": {
         "name": "database-tools"
       }
     }
   }
   ```

4. **Use consistent naming conventions**:
   - Use kebab-case: `my-server`, `api-tools`, `db-connector`
   - Use descriptive names: `python-analyzer`, `remote-api`, `local-tools`
   - Match case exactly: if key is `MyServer`, name must be `MyServer`

5. **Run validation**:

   ```bash
   claudelint check-mcp
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

This rule provides valuable consistency checking and should generally remain enabled. However, you might disable it if:

- Working with legacy configurations where changing keys would break other tooling
- Server keys are generated programmatically and cannot match names
- Your team has a deliberate convention for different key and name formats

To disable:

```json
{
  "rules": {
    "mcp-server-key-mismatch": "off"
  }
}
```

## Related Rules

- [mcp-invalid-server](./mcp-invalid-server.md) - Server configuration validation

## Resources

- [Rule Implementation](../../src/rules/mcp/mcp-server-key-mismatch.ts)
- [Rule Tests](../../tests/rules/mcp/mcp-server-key-mismatch.test.ts)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Version

Available since: v1.0.0
