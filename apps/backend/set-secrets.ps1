# Script to set Cloudflare Workers secrets from .env.production file
# Usage: .\set-secrets.ps1 [environment]
# Example: .\set-secrets.ps1 production

param(
    [string]$Environment = "production"
)

$envFile = ".env.production"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading secrets from $envFile for environment: $Environment" -ForegroundColor Cyan
Write-Host ""

$secretsSet = 0
$secretsSkipped = 0

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        if ([string]::IsNullOrWhiteSpace($key) -or [string]::IsNullOrWhiteSpace($value)) {
            Write-Host "Skipping invalid line: $line" -ForegroundColor Yellow
            $secretsSkipped++
            return
        }
        
        Write-Host "Setting secret: $key" -ForegroundColor Green
        echo $value | wrangler secret put $key --env $Environment
        
        if ($LASTEXITCODE -eq 0) {
            $secretsSet++
        } else {
            Write-Host "Failed to set secret: $key" -ForegroundColor Red
            $secretsSkipped++
        }
        Write-Host ""
    } else {
        Write-Host "Skipping invalid format: $line" -ForegroundColor Yellow
        $secretsSkipped++
    }
}

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Secrets set: $secretsSet" -ForegroundColor Green
if ($secretsSkipped -gt 0) {
    Write-Host "  Secrets skipped/failed: $secretsSkipped" -ForegroundColor Yellow
}

