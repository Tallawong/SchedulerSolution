param location string = resourceGroup().location

param storageNamePrefix string

param acr_name string = 'schedregistry2026'
param asb_name string = 'schedservicebusasb'
param asp_name string = 'ASP-${app_name}'
param app_name string = 'SchedulerApp'
param swa_name string = 'WEB-${app_name}'
param repository_url string = ''
param repository_branch string = 'main'
param repositoryToken string = ${{env:REPOSITORY_TOKEN}}

var stgacc_name = '${storageNamePrefix}${uniqueString(resourceGroup().id)}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: stgacc_name
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource container_registry 'Microsoft.ContainerRegistry/registries@2021-09-01' = {
  name: acr_name
  location: location
  sku: {
    name: 'Basic'
  }
properties: {
    adminUserEnabled: true
  }
}
resource asb 'Microsoft.ServiceBus/namespaces@2021-11-01' = {
  name: asb_name
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: asp_name
  location: location
  kind: ''
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  dependsOn: []
}

resource name_resource 'Microsoft.Web/sites@2024-04-01' = {
  name: app_name
  location: location
  properties: {
    serverFarmId: hostingPlan.id
    clientAffinityEnabled: false
    httpsOnly: true
  }
  dependsOn: []
}

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: swa_name
  location: location
  tags: {}
  properties: {
    deploymentAuthPolicy: 'DeploymentToken'
    repositoryUrl: repository_url
    branch: repository_branch
    repositoryToken: repositoryToken
    enterpriseGradeCdnStatus: enterpriseGradeCdnStatus
    provider: 'GitHub' // Use 'DevOps' if using Azure DevOps Pipelines
  }
  sku: {
    tier: 'Standard'
    name: 'Standard'
  }
}
