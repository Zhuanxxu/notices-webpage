# Script para matar procesos en puertos específicos
param(
    [int]$Port = 3001
)

Write-Host "Buscando procesos en puerto $Port..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connections) {
    $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $processes) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Terminando proceso: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "✓ Procesos en puerto $Port terminados" -ForegroundColor Green
} else {
    Write-Host "✓ No hay procesos usando el puerto $Port" -ForegroundColor Green
}

# También terminar procesos Node.js que puedan estar colgados
Write-Host "`nLimpiando procesos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "Terminando proceso Node.js (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Procesos Node.js terminados" -ForegroundColor Green
} else {
    Write-Host "✓ No hay procesos Node.js corriendo" -ForegroundColor Green
}
