$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidDir = Join-Path $root "run-logs\\pids"

function Get-PortOwnerPid {
    param([int]$Port)

    $connection = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($connection) {
        return $connection.OwningProcess
    }

    return $null
}

$servicePorts = @{
    "ai-service.pid" = 8001
    "backend.pid" = 5000
    "frontend.pid" = 5173
}

if (-not (Test-Path $pidDir)) {
    New-Item -ItemType Directory -Path $pidDir -Force | Out-Null
}

Get-ChildItem $pidDir -Filter "*.pid" | ForEach-Object {
    $pidValue = Get-Content $_.FullName | Select-Object -First 1
    $portValue = $servicePorts[$_.Name]
    if ($pidValue -and (Get-Process -Id $pidValue -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $pidValue -Force
        Write-Output "Stopped PID $pidValue from $($_.Name)"
    }

    if ($portValue) {
        $portOwner = Get-PortOwnerPid -Port $portValue
        if (
            $portOwner -and
            $portOwner -ne $pidValue -and
            (Get-Process -Id $portOwner -ErrorAction SilentlyContinue)
        ) {
            Stop-Process -Id $portOwner -Force
            Write-Output "Stopped port owner PID $portOwner for $($_.Name)"
        }
    }
    Remove-Item $_.FullName -Force
}

foreach ($entry in $servicePorts.GetEnumerator()) {
    $portOwner = Get-PortOwnerPid -Port $entry.Value
    if ($portOwner -and (Get-Process -Id $portOwner -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $portOwner -Force
        Write-Output "Stopped residual port owner PID $portOwner for $($entry.Key)"
    }
}
