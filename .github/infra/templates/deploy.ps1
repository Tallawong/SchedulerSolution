#az provider show --namespace Microsoft.AlertsManagement --query registrationState -o tsv
#az provider register --namespace Microsoft.AlertsManagement --wait  
#az group create --name JDGroup --location centralus 
az deployment group create --resource-group JDGroup --template-file main.bicep