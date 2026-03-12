$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$logs = Join-Path $root "run-logs"
$pids = Join-Path $logs "pids"

New-Item -ItemType Directory -Path $logs -Force | Out-Null
New-Item -ItemType Directory -Path $pids -Force | Out-Null

function Get-PortOwnerPid {
    param([int]$Port)

    $connection = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($connection) {
        return $connection.OwningProcess
    }

    return $null
}

$services = @(
    @{
        Name = "ai-service"
        Port = 8001
        WorkingDirectory = Join-Path $root "ai-service"
        FilePath = Join-Path $root "ai-service\\.venv\\Scripts\\python.exe"
        ArgumentList = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001")
    },
    @{
        Name = "backend"
        Port = 5000
        WorkingDirectory = Join-Path $root "backend"
        FilePath = (Get-Command node).Source
        ArgumentList = @("server.js")
    },
    @{
        Name = "frontend"
        Port = 5173
        WorkingDirectory = Join-Path $root "frontend"
        FilePath = (Get-Command node).Source
        ArgumentList = @(".\\node_modules\\vite\\bin\\vite.js", "--host", "127.0.0.1", "--port", "5173")
    }
)

foreach ($service in $services) {
    $pidFile = Join-Path $pids "$($service.Name).pid"
    if (Test-Path $pidFile) {
        $existingPid = Get-Content $pidFile | Select-Object -First 1
        if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
            Write-Output "$($service.Name) already running with PID $existingPid"
            continue
        }
    }

    $existingPortOwner = Get-PortOwnerPid -Port $service.Port
    if ($existingPortOwner) {
        Set-Content -Path $pidFile -Value $existingPortOwner
        Write-Output "$($service.Name) already listening on port $($service.Port) with PID $existingPortOwner"
        continue
    }

    $stdout = Join-Path $logs "$($service.Name).out.log"
    $stderr = Join-Path $logs "$($service.Name).err.log"

    if (Test-Path $stdout) { Remove-Item $stdout -Force }
    if (Test-Path $stderr) { Remove-Item $stderr -Force }

    $process = Start-Process `
        -FilePath $service.FilePath `
        -ArgumentList $service.ArgumentList `
        -WorkingDirectory $service.WorkingDirectory `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -WindowStyle Hidden `
        -PassThru

    $trackedPid = $process.Id
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 500
        $portOwner = Get-PortOwnerPid -Port $service.Port
        if ($portOwner) {
            $trackedPid = $portOwner
            break
        }
        if (-not (Get-Process -Id $process.Id -ErrorAction SilentlyContinue)) {
            break
        }
    }

    if (-not (Get-PortOwnerPid -Port $service.Port)) {
        Write-Output "Failed to confirm $($service.Name) on port $($service.Port). Check logs in $logs."
    }

    Set-Content -Path $pidFile -Value $trackedPid
    Write-Output "Started $($service.Name) with PID $trackedPid"
}

Write-Output "Logs: $logs"
