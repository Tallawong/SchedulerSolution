# Configure to run c# server on one of the VM 
$env:HOST="localhost"
$env:IP="127.0.0.1"

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

openssl req -x509 -newkey rsa:4096 -keyout tls.key -out tls.crt -sha256 -days 3650 -nodes -subj "/CN=$env:HOST" -addext "subjectAltName = DNS:$env:HOST,IP.1:$env:IP" -addext "keyUsage = digitalSignature, keyEncipherment"
openssl pkcs12 -export -out tls.pfx -inkey tls.key -in tls.crt -passout pass:$pass1

Import-PfxCertificate -FilePath ./tls.pfx -CertStoreLocation Cert:\CurrentUser\My -Password $securePassword 
Import-PfxCertificate -FilePath ./tls.pfx -CertStoreLocation Cert:\CurrentUser\Root -Password $securePassword

openssl pkcs12 -in tls.pfx -clcerts -nokeys -out cert-from-pfx.pem 
openssl pkcs12 -in tls.pfx -nocerts -nodes -out key-from-pfx.pem

rm tls.crt
rm tls.key
##rm tls.pfx
