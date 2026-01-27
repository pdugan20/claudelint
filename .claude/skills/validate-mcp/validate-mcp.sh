#!/bin/bash
# Validate MCP server configuration

set -e

# Run claudelint validate-mcp with provided arguments
claudelint validate-mcp "$@"
