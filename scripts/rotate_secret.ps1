# PowerShell Script for Automatic 2-Minute API_SECRET Rotation

$FrontendEnvPath = "$PSScriptRoot\..\.env"
$BackendEnvPath  = "$PSScriptRoot\..\..\api-key-backend\.env"

function Get-RandomSecret {
    $Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $Rand = -join ((1..8) | ForEach-Object { $Chars[(Get-Random -Maximum $Chars.Length)] })
    return "ROTATED_SECRET_$Rand"
}

function Update-EnvFile($FilePath, $NewSecret) {
    if (Test-Path $FilePath) {
        $Content = Get-Content $FilePath -Raw
        if ($Content -match "API_SECRET=.*") {
            $Content = $Content -replace "API_SECRET=.*", "API_SECRET=$NewSecret"
        } else {
            $Content += "`nAPI_SECRET=$NewSecret"
        }
        Set-Content -Path $FilePath -Value $Content -NoNewline
    }
}

function Invoke-Rotation {
    $NewSecret = Get-RandomSecret
    $TimeStamp = (Get-Date).ToLongTimeString()
    
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host "[$TimeStamp] 🔄 ROTATION TRIGGERED" -ForegroundColor Yellow
    Write-Host "[$TimeStamp] New API_SECRET: $NewSecret" -ForegroundColor Green
    
    Update-EnvFile -FilePath $FrontendEnvPath -NewSecret $NewSecret
    Update-EnvFile -FilePath $BackendEnvPath  -NewSecret $NewSecret

    try {
        docker exec -e "API_SECRET=$NewSecret" api-key-frontend sh -c "echo 'export API_SECRET=""$NewSecret""' > /etc/environment && envsubst '`$API_SECRET `$BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -s reload" 2>$null
        Write-Host "[$TimeStamp] ✅ Container Nginx config & /etc/environment reloaded." -ForegroundColor Green
    } catch {
        Write-Host "[$TimeStamp] ℹ️ (Nginx update skipped)" -ForegroundColor DarkGray
    }

    Write-Host "[$TimeStamp] 🔒 DATABASE_ENCRYPTION_KEY status: UNTOUCHED (NO ROTATION)" -ForegroundColor Cyan
    Write-Host "==================================================`n" -ForegroundColor Cyan
}

Write-Host "🚀 Automatic API_SECRET Rotation Service Started." -ForegroundColor Green
Write-Host "⏱️ Schedule: Every 2 minutes`n" -ForegroundColor Yellow

while ($true) {
    Invoke-Rotation
    Start-Sleep -Seconds 120
}
