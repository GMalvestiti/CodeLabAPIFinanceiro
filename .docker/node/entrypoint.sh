#!/bin/bash

echo "Container em execução"

# tail -f /dev/null

# npm dedupe

npm install --legacy-peer-deps

npm run migration:run

npm run start:debug