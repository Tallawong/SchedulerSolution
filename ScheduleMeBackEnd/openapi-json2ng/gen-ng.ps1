# Use OpenAPI Generator (1 & 2 are prerequisites)

# 1) Get the OpenAPI JSON  file from your running C# application (usually found at /openapi/v1.json). 
# Save it as v1.json in your project folder.

# 2) Install OpenAPI Generator:
npx @openapitools/openapi-generator-cli version

# 3) Generate the Angular access code using OpenAPI Generator:
#$env:JAVA_TOOL_OPTIONS="-Dio.swagger.parser.v3.util.RemoteUrl.trustAll=true"
npx @openapitools/openapi-generator-cli generate -i ./v1.json -g typescript-angular -o ../../ScheduleMeFrontEnd/src/app/shared/openapi-api-client