# Configure to run c# server on one of the VM 
$env:HOST="parish.api"
$env:IP="192.168.0.15"

Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.Subject -match $env:HOST} | Remove-Item
Get-ChildItem Cert:\CurrentUser\Root | Where-Object {$_.Subject -match $env:HOST} | Remove-Item

do {
    $p1 = Read-Host "Type the password for the private key Password" -AsSecureString
    $p2 = Read-Host "Confirm Password" -AsSecureString

    if ($p1.Length -eq 0) {
        Write-Warning "Password cannot be empty."
        $match = $false
        continue
    }

    # Convert to plain text to compare
    $bstr1 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p1)
    $pass1 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr1)
    
    $bstr2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p2)
    $pass2 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr2)

    if ($pass1 -eq $pass2) {
        $match = $true
        Write-Host "Passwords match!" -ForegroundColor Green
        # $p1 now holds the secure password
    } else {
        $match = $false
        Write-Warning "Passwords do not match. Please try again."
    }
} until ($match)

$securePassword = ConvertTo-SecureString -String $pass1 -AsPlainText -Force

openssl req -x509 -newkey rsa:4096 -keyout tls-ing.key -out tls-ing.crt -sha256 -days 3650 -nodes -subj "/CN=$env:HOST" -addext "subjectAltName = DNS:$env:HOST,IP.1:$env:IP" -addext "keyUsage = digitalSignature, keyEncipherment"
openssl pkcs12 -export -out tls-ing.pfx -inkey tls-ing.key -in tls-ing.crt -passout pass:$pass1

Import-PfxCertificate -FilePath tls-ing.pfx -CertStoreLocation Cert:\CurrentUser\My -Password $securePassword 
Import-PfxCertificate -FilePath tls-ing.pfx -CertStoreLocation Cert:\CurrentUser\Root -Password $securePassword

# Copy private key and certificate of rejkid-backend-tls Secret to k8s-01
scp tls-ing.crt rejkid@192.168.0.136:/home/rejkid/rejkid-deployment/tls.crt
scp tls-ing.key rejkid@192.168.0.136:/home/rejkid/rejkid-deployment/tls.key

rm tls-ing.crt
rm tls-ing.key
REM rm tls-ing.pfx

# From Windows on k8s-01 run few commands
ssh rejkid@192.168.0.136 "cd /home/rejkid/rejkid-deployment && kubectl -n rejkid-ns delete secret rejkid-backend-tls --ignore-not-found"
ssh rejkid@192.168.0.136 "cd /home/rejkid/rejkid-deployment && kubectl create secret tls rejkid-backend-tls --cert=tls.crt --key=tls.key -n rejkid-ns"
ssh rejkid@192.168.0.136 "cd /home/rejkid/rejkid-deployment && rm tls.key && rm tls.crt"
ssh rejkid@192.168.0.136 "cd /home/rejkid/rejkid-deployment && kubectl rollout restart -n rejkid-ns deploy/rejkid-backend"
