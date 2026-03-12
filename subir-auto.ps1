# Auto commit + push: a cada intervalo verifica alterações e sobe no Git.
# Uso: .\subir-auto.ps1
# Encerrar: Ctrl+C

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not (Test-Path (Join-Path $root ".git"))) {
    Write-Host "Pasta sem repositório Git. Execute na raiz do projeto." -ForegroundColor Red
    exit 1
}

$intervaloSeconds = 60

Write-Host "Auto-subida ativo. Verificando a cada ${intervaloSeconds}s. Ctrl+C para sair." -ForegroundColor Yellow
Write-Host "Pasta: $root`n" -ForegroundColor Gray

while ($true) {
    Set-Location $root
    $status = git status --porcelain
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        $msg = "auto: " + (Get-Date -Format "yyyy-MM-dd HH:mm")
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Alterações detectadas. Commit: $msg" -ForegroundColor Cyan
        git add -A
        git commit -m $msg
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Concluído. (Push pelo hook.)" -ForegroundColor Green
    }
    Start-Sleep -Seconds $intervaloSeconds
}
