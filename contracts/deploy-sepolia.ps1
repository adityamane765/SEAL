# Deploy SEAL to Ethereum Sepolia via Hardhat (requires Node + npm install in contracts/)
# Usage: cd contracts; . .\deploy-sepolia.ps1
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing contracts/.env (PRIVATE_KEY, SEPOLIA_RPC_URL)"
}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $n = $matches[1].Trim()
    $v = $matches[2].Trim()
    [Environment]::SetEnvironmentVariable($n, $v, "Process")
  }
}
if (-not $env:PRIVATE_KEY) { Write-Error "PRIVATE_KEY not set in .env" }
if (-not $env:SEPOLIA_RPC_URL) { Write-Error "SEPOLIA_RPC_URL not set in .env" }
if (-not (Test-Path (Join-Path $here "node_modules"))) {
  Write-Error "Run: cd contracts; npm install"
}
Push-Location $here
try {
  npx hardhat run scripts/deploy-sepolia.js --network sepolia
} finally {
  Pop-Location
}
