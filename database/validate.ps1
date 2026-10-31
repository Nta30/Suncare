param([string]$Server = 'lpc:.')
$ErrorActionPreference = 'Stop'
$sqlcmd = (Get-Command sqlcmd -ErrorAction Stop).Source
$testDatabase = 'SuncareSchemaCheck_' + [Guid]::NewGuid().ToString('N')
$created = $false
function Invoke-CheckSql([string[]]$SqlArgs) {
    & $sqlcmd -S $Server -E -C -I -b -r 1 -l 10 @SqlArgs
    if ($LASTEXITCODE -ne 0) { throw ('sqlcmd failed: ' + ($SqlArgs -join ' ')) }
}
try {
    Invoke-CheckSql @('-d','master','-Q',"CREATE DATABASE [$testDatabase] COLLATE Latin1_General_100_CI_AS_SC;")
    $created = $true
    foreach ($script in @('01_schema.sql','02_seed_rbac.sql','02_seed_rbac.sql','03_reporting_views.sql','04_smoke_test.sql')) {
        Invoke-CheckSql @('-d',$testDatabase,'-i',(Join-Path $PSScriptRoot $script))
    }
    Invoke-CheckSql @('-d',$testDatabase,'-Q',"SET NOCOUNT ON; SELECT COUNT(*) AS table_count FROM sys.tables WHERE is_ms_shipped=0; DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS;")
    Write-Output 'PASS: schema, repeatable RBAC seed, views, smoke tests and constraint scan.'
}
finally {
    # Only clean up the GUID-named database this invocation successfully created.
    if ($created -and $testDatabase -match '^SuncareSchemaCheck_[a-f0-9]{32}$') {
        Invoke-CheckSql @('-d','master','-Q',"ALTER DATABASE [$testDatabase] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$testDatabase];")
    }
}
