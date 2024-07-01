#!/bin/bash
set -o pipefail

################################
## Helpers

yell() { echo "$0: $*" >&2; }
die() { yell "$*" && exit 111; }
try() { "$@" || die "cannot $*"; }

_ENV="BE-TRIAL"

################################
## Environment Selection
echo "==================="

echo "Deploying Environment: $_ENV"

echo "==================="

################################
## Setup

_AWS="aws --profile mifu-trial --region eu-west-1"

CACHE_DIR="$(dirname "$0")/.cache"
BUCKET_NAME="mifu-be-trial-artifacts"

APP_FILE="app.yaml"
APP_OUT_FILE="$CACHE_DIR/$_ENV-app-out.yaml"

mkdir -p "$CACHE_DIR"

STACK_NAME="mifu-be-trial"

################################
## Build TypeScript project

echo "Building TypeScript project"
npm run build

################################
## Create s3 bucket for artifacts

BUCKET_HEAD=$($_AWS s3api head-bucket --bucket "$BUCKET_NAME" 2>&1)
if echo "$BUCKET_HEAD" | grep -q 'Not Found'; then
    echo "Creating bucket $BUCKET_NAME"
    $_AWS s3 mb "s3://$BUCKET_NAME"
else
    echo "Bucket $BUCKET_NAME found"
fi

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

rm -rf "$NODE_LAYER_PATH"
mkdir -p "$NODE_LAYER_PATH/nodejs"
cp "$(dirname "$0")/../package.json" "$NODE_LAYER_PATH/nodejs/package.json"

npm install --prefix "$NODE_LAYER_PATH/nodejs" --omit=dev

echo "==================="

################################
## Deploy

$_AWS cloudformation package \
    --template-file "$APP_FILE" \
    --s3-bucket "$BUCKET_NAME" \
    --output-template-file "$APP_OUT_FILE"


$_AWS cloudformation deploy \
    --s3-bucket "$BUCKET_NAME" \
    --template-file "$APP_OUT_FILE" \
    --stack-name "S-${_ENV}-${STACK_NAME}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --tags "user:Application"="$STACK_NAME" "user:Stack"="$_ENV"

