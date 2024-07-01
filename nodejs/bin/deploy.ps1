$ENV = $args[0]
$CACHE_DIR = ".cache"
$BIN_DIR = "bin/.cache"
$SERVICES_LAYER_PATH = "$BIN_DIR/services-layer/nodejs/services"
$UTILS_LAYER_PATH = "$BIN_DIR/utils-layer/nodejs/utils"
$NODE_MODULES_PATH = "$BIN_DIR/node_dependencies/nodejs"
$BUCKET = "mifu-search-artifacts-${ENV}"
$TEMPLATE_FILE = "app.yaml"
$OUTPUT_TEMPLATE_FILE = "$BIN_DIR/$env-app-out.yaml"

# Creating S3 bucket
aws s3 mb s3://${BUCKET} --profile bo

# Create all the directories
Remove-Item $CACHE_DIR -Recurse -Force -Confirm:$false
New-Item $CACHE_DIR -itemType Directory
cd ..
New-Item $SERVICES_LAYER_PATH -itemType Directory
New-Item $UTILS_LAYER_PATH -itemType Directory
New-Item $NODE_MODULES_PATH -itemType Directory
New-Item $OUTPUT_TEMPLATE_FILE -itemType File

# Copy necessary layers
Copy-Item -Path services\* -Destination $SERVICES_LAYER_PATH -PassThru -Recurse
Copy-Item -Path utils\* -Destination $UTILS_LAYER_PATH -PassThru -Recurse
Copy-Item -Path package.json -Destination $NODE_MODULES_PATH -PassThru -Recurse

# Install production node_modules
cd $NODE_MODULES_PATH
npm install --omit=dev
cd..;cd..;cd..;cd..

# Deploy the stack
aws cloudformation package \
    --template-file $TEMPLATE_FILE \
    --s3-bucket $BUCKET \
    --output-template-file $OUTPUT_TEMPLATE_FILE

aws cloudformation deploy \
    --s3-bucket "$BUCKET" \
    --template-file "$OUTPUT_TEMPLATE_FILE" \
    --stack-name "{$ENV}_mifu_search" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides EnvironmentName="$_ENV" DataEnvironmentName="$_ENV" \
    --tags "user:Application"="$STACK_NAME" "user:Stack"="$_ENV"

cd bin

