# Delete every row tied to bevanrhee@gmail.com from the local ParadePaard databases.
#
# Run from PowerShell on the host that runs the docker-compose stack:
#   pwsh ./delete_bevanrhee.ps1
# or to preview without deleting:
#   pwsh ./delete_bevanrhee.ps1 -DryRun
#
# Requires: Docker Desktop running, with the auth/user/contract/payroll/timesheet/planning
# *-db containers up (the docker-compose.yml in Program/microservice).

param(
    [string]$Email = "bevanrhee@gmail.com",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SweepSql  = Join-Path $ScriptDir "delete_user_by_email.sql"

if (-not (Test-Path $SweepSql)) {
    throw "Cannot find delete_user_by_email.sql next to this script."
}

# Service DB containers as defined in Program/microservice/docker-compose.yml.
# Order: auth + user first (they hold the email lookup), then the downstream services.
$EmailDbs = @("auth-service-db", "user-service-db")
$AllDbs   = @(
    "auth-service-db",
    "user-service-db",
    "contract-service-db",
    "payroll-service-db",
    "timesheet-service-db",
    "planning-service-db"
)

function Invoke-Psql {
    param(
        [string]$Container,
        [string]$Sql,
        [string[]]$ExtraArgs = @()
    )
    $args = @("exec", "-i", $Container, "psql", "-U", "admin_user", "-d", "db", "-v", "ON_ERROR_STOP=1") + $ExtraArgs
    return ($Sql | & docker @args)
}

function Get-UserId {
    param([string]$Container, [string]$Email)
    # Try common id column names: "id" (auth-service) and "user_id" (user-service).
    $sql = @"
SELECT COALESCE(
    (SELECT id::text FROM public.users WHERE lower(email) = lower('$Email') LIMIT 1),
    (SELECT user_id::text FROM public.users WHERE lower(email) = lower('$Email') LIMIT 1)
);
"@
    $result = Invoke-Psql -Container $Container -Sql $sql -ExtraArgs @("-tA")
    if ($null -eq $result) { return $null }
    $trimmed = ($result | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { return $null }
    return $trimmed
}

Write-Host "Resolving user_id for $Email..." -ForegroundColor Cyan
$targetIds = New-Object System.Collections.Generic.HashSet[string]
foreach ($db in $EmailDbs) {
    try {
        $id = Get-UserId -Container $db -Email $Email
    } catch {
        Write-Warning ("Could not query {0}: {1}" -f $db, $_.Exception.Message)
        continue
    }
    if ($id) {
        Write-Host ("  {0}: {1}" -f $db, $id) -ForegroundColor Green
        [void]$targetIds.Add($id)
    } else {
        Write-Host ("  {0}: no match" -f $db) -ForegroundColor DarkGray
    }
}

if ($targetIds.Count -eq 0) {
    Write-Host "No user found with email $Email in auth or user-service DB. Nothing to delete." -ForegroundColor Yellow
    exit 0
}

if ($DryRun) {
    Write-Host "`n[DryRun] Would sweep these IDs across all DBs:" -ForegroundColor Yellow
    $targetIds | ForEach-Object { Write-Host "  $_" }
    Write-Host "[DryRun] Skipping deletes." -ForegroundColor Yellow
    exit 0
}

$SweepSqlBody = Get-Content -Raw -Path $SweepSql

foreach ($db in $AllDbs) {
    Write-Host "`n--- $db ---" -ForegroundColor Cyan
    foreach ($id in $targetIds) {
        $injected = "\set target_id '''$id'''" + "`n" + $SweepSqlBody
        try {
            $out = Invoke-Psql -Container $db -Sql $injected
            if ($out) { $out | Write-Host }
        } catch {
            Write-Warning ("{0} sweep failed for {1}: {2}" -f $db, $id, $_.Exception.Message)
        }
    }
}

# Belt-and-braces: also delete by email directly from auth + user DBs in case the
# row wasn't reachable via user_id (e.g. orphaned mismatch between services).
foreach ($db in $EmailDbs) {
    $sql = "DELETE FROM public.users WHERE lower(email) = lower('$Email');"
    try {
        $out = Invoke-Psql -Container $db -Sql $sql
        Write-Host ("{0}: {1}" -f $db, $out) -ForegroundColor Green
    } catch {
        Write-Warning ("{0} email delete failed: {1}" -f $db, $_.Exception.Message)
    }
}

Write-Host "`nDone." -ForegroundColor Green
