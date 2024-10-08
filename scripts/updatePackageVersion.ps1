param (
    [Parameter(Mandatory = $true)]
    [string]$PathToWorkspace
)

$packageJson = Get-Content "$PathToWorkspace\vscode-cli-microsoft365\package.json" | ConvertFrom-Json
$oldVersion = $packageJson.version
$oldVersionParts = $oldVersion.Split(".")
$newVersion = "$($oldVersionParts[0]).$($oldVersionParts[1]).$([int]$oldVersionParts[2] + 1)"
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json  -Depth 10 | Out-File "$PathToWorkspace\vscode-cli-microsoft365\package.json" -Encoding utf8 -Force