#!/bin/sh

while true; do
  node -r dotenv/config index.js
  echo "running again"
done
