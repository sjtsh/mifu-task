#!/bin/bash

# Check if two arguments are provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./test.sh [FunctionName]"
    exit 1
fi

# Assign arguments to variables
FUNCTION_NAME=$1

################################
## Setup

export AWS_PROFILE=mifu
CACHE_DIR="$(dirname "$0")/.cache"

PACKAGE_JSON_PATH="$(dirname "$0")/../package.json"
HASH_FILE="$CACHE_DIR/package-hash"

# Generate hash of the package.json
CURRENT_HASH=$(sha256sum "$PACKAGE_JSON_PATH" | awk '{print $1}')

# Check if the hash file exists and compare the hash
if [ -f "$HASH_FILE" ]; then
    STORED_HASH=$(cat "$HASH_FILE")
    if [ "$CURRENT_HASH" == "$STORED_HASH" ]; then
        echo "package.json has not changed. Skipping npm install."
        SKIP_INSTALL=true
    fi
fi

mkdir -p "$CACHE_DIR"

################################
## Clean Project

rm -rf "$CACHE_DIR"

################################
## Build TypeScript project

echo "Building TypeScript project"
npm run build

################################
## Setup layers

echo "==================="

SERVICES_LAYER_PATH="$CACHE_DIR/services-layer"
echo "Setting up services layer: $SERVICES_LAYER_PATH"

rm -rf "$SERVICES_LAYER_PATH"
mkdir -p "$SERVICES_LAYER_PATH/nodejs"
mv "$CACHE_DIR/services" "$SERVICES_LAYER_PATH/nodejs"

UTILS_LAYER_PATH="$CACHE_DIR/utils-layer"
echo "Setting up utils layer: $UTILS_LAYER_PATH"

rm -rf "$UTILS_LAYER_PATH"
mkdir -p "$UTILS_LAYER_PATH/nodejs"
mv "$CACHE_DIR/utils" "$UTILS_LAYER_PATH/nodejs"

NODE_LAYER_PATH="$CACHE_DIR/node_dependencies"
echo "Setting up node layer: $NODE_LAYER_PATH"

echo "==================="

################################
## Setup Node Dependencies Layer

NODE_LAYER_PATH="$CACHE_DIR/node_dependencies"

# Copy package.json to the node layer
mkdir -p "$NODE_LAYER_PATH/nodejs"
cp "$(dirname "$0")/../package.json" "$NODE_LAYER_PATH/nodejs/package.json"


# Run npm install if package.json has changed
# if [ -z "$SKIP_INSTALL" ]; then
echo "package.json has changed. Running npm install."
npm install --prefix "$NODE_LAYER_PATH/nodejs" --omit=dev
echo "$CURRENT_HASH" > "$HASH_FILE"
# fi

echo "==================="

################################
# Invoke the function locally using SAM CLI
echo "Invoking function $FUNCTION_NAME with test file tests/$FUNCTION_NAME.json ..."
sam local invoke $FUNCTION_NAME --template app.yaml -e tests/$FUNCTION_NAME.json --profile mifu --region eu-west-1 | grep -E "INFO|ERROR|WARN"

# Check if SAM CLI command was successful
if [ $? -ne 0 ]; then
    echo "SAM local invoke failed, exiting."
    exit 1
fi

echo "Test completed successfully."
