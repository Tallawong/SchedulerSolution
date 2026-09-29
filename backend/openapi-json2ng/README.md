# aspnet-core-3-signup-verification-api

You can convert a C# OpenAPI (Swagger) specification into Angular interfaces and services using 
specialized code generation tools.

OpenAPI Generator (typescript-angular generator): The industry standard tool that parses JSON or YAML 
specs to generate type-safe TypeScript interfaces and Angular services utilizing HttpClient. 
Run it via @openapitools/openapi-generator-cli. 
[1] (https://mokkappsdev.medium.com/how-to-generate-angular-spring-code-from-openapi-specification-5bdbe817d26c), 
[2] (https://angular.schule/blog/2025-06-openapi-generator/), 
[3] (https://medium.com/@piyalidas.it/angular-19-with-openapi-code-generator-for-consuming-api-22dbb9f53c46)

For this project we have selected OpenAPI Generator.
It requires manual step of generating v1.json (document identifier) from scalar OpenAPI spec, 
then running the generator to produce Angular code.
1) Get the OpenAPI JSON  file from your running C# application (usually found at /openapi/v1.json). 
Save it as v1.json in your ./openapi-json2ng sub-folder.
For the time being the recommended approach is to **keep `AccountService` as a thin wrapper and 
replace its HTTP calls with generated `AccountsService` calls**. 
This preserves existing component behavior and keeps custom logic outside files overwritten by regeneration.
 
 1.	ASP.NET Core generates the OpenAPI document from API endpoints and metadata.
 2.	/openapi/v1.json exposes that document; saving it locally is exporting the OpenAPI specification.
 3.	Scalar displays the document as interactive API documentation—it does not generate it.
 4.	Converting v1.json into Angular services is OpenAPI client code generation.