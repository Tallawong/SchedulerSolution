param location string = resourceGroup().location

param storageNamePrefix string

param acr_name string = 'schedregistry2026'
param asb_name string = 'schedservicebusasb'
param asp_name string = 'ASP-${app_name}'
param app_name string = 'SchedulerApp'
param swa_name string = 'web-${toLower(app_name)}-${substring(uniqueString(subscription().id, resourceGroup().id), 0, 6)}'

param tags object = {
  environment: 'production'
  project: 'SchedulerSolution'
  managedBy: 'bicep'
}

var stgacc_name = '${storageNamePrefix}${uniqueString(resourceGroup().id)}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: stgacc_name
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource container_registry 'Microsoft.ContainerRegistry/registries@2021-09-01' = {
  name: acr_name
  location: location
  tags: tags
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
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: asp_name
  location: location
  tags: tags
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

resource webApp  'Microsoft.Web/sites@2024-04-01' = {
  name: app_name
  location: location
  tags: tags
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
  tags: tags
  sku: {
    tier: 'Standard'
    name: 'Standard'
  }
}
