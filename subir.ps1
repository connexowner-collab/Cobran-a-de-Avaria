# Script para subir alterações para o Git (add + commit + push)
# Uso: .\subir.ps1
#      .\subir.ps1 "mensagem do commit"

param([string]$mensagem = "chore: atualização")

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Adicionando alterações..." -ForegroundColor Cyan
git add -A

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nenhuma alteração para enviar." -ForegroundColor Yellow
    exit 0
}

Write-Host "Status:" -ForegroundColor Cyan
git status --short

Write-Host "`nCommit: $mensagem" -ForegroundColor Cyan
git commit -m $mensagem

Write-Host "`nEnviando para origin/main..." -ForegroundColor Cyan
git push origin main --force

Write-Host "`nConcluído." -ForegroundColor Green
