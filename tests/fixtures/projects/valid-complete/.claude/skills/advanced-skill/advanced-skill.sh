#!/bin/bash
set -euo pipefail

# Deploy the project
npm run build
echo "Deployment complete"
