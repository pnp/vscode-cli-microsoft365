param (
    [Parameter(Mandatory = $true)]
    [string]$PathToWorkspace
)

$allCommands = Get-ChildItem -Path "$PathToWorkspace\cli-microsoft365\docs\docs\cmd\*.mdx" -Recurse -Force -Exclude "_global*"

$globalContent = Get-Content "$PathToWorkspace\cli-microsoft365\docs\docs\cmd\_global.mdx"
$globalContent = $globalContent.Replace('```md definition-list', '').Replace('```', '')
[hashtable]$global = @{}
$global.Add('content', $globalContent)
New-Object -TypeName psobject -Property $global | ConvertTo-Json | Out-File "$PathToWorkspace\vscode-cli-microsoft365\data\global.json"

[hashtable]$commandSnippets = @{}
[hashtable]$m365Model = @{}
$commands = @()

foreach ($command in $allCommands) {
    $commandDocs = ConvertFrom-Markdown -Path $command
    $html = New-Object -Com 'HTMLFile'
    $html.write([ref]$commandDocs.Html)
        
    $title = $html.all.tags('h1')[0]
    $commandTitle = $title.innerText
    $titleIndex = @($html.all).IndexOf($title)
        
    $usage = $html.all.tags('h2') | Where-Object { $_.tagName -eq 'H2' } | Select-Object -First 1
    $usageIndex = @($html.all).IndexOf($usage)
    $commandDescription = @($html.all)[($titleIndex + 1)..($usageIndex - 1)]
    $commandDescription = $commandDescription | ForEach-Object { $_.innerText }
        
    $subTitles = $html.all.tags('h2') | Where-Object { $_.tagName -eq 'H2' } | Select-Object -First 3
    $optionsStartIndex = @($html.all).IndexOf($subTitles[1])
    $optionsEndIndex = @($html.all).IndexOf($subTitles[2])
    $commandOptions = @($html.all)[($optionsStartIndex + 1)..($optionsEndIndex - 1)]
    $commandOptions = $commandOptions | Where-Object { $_.nodeName -eq 'CODE' } | ForEach-Object { $_.innerText }
    $commandOptions = $commandOptions  -split '\r?\n'
    $commandOptions = $commandOptions | Where-Object { $_ -match '\<(.*?)\>' }
    $commandOptions = $commandOptions | ForEach-Object { $_.split('<')[1].split('>')[0] }
    $commandOptions = $commandOptions | ForEach-Object { "--" + $_ + ' $' + $($commandOptions.IndexOf($_) + 1) }
    $commandOptions = $commandOptions -join " "

    [hashtable]$commandProperties = [ordered]@{}
    $commandProperties.Add('prefix', @("m365 $commandTitle"))
    $commandProperties.Add('body', @("m365 $commandTitle $commandOptions"))
    $commandProperties.Add('description', "$commandDescription")
    $commandClass = New-Object -TypeName psobject -Property $commandProperties

    $commandSnippets.Add($commandTitle, $commandClass)

    $commandUrl = $command.FullName.Split("cli-microsoft365")[1]
    $commandUrl = $commandUrl.Replace('\', '/')
    $commandDocsUrl = $commandUrl.Replace('docs/docs/', '')
    $commandDocsUrl = $commandDocsUrl.Replace('.mdx', '')
    $commands += [pscustomobject]@{
        name = "$commandTitle"; 
        url = "https://raw.githubusercontent.com/pnp/cli-microsoft365/main$commandUrl";
        docs = "https://pnp.github.io/cli-microsoft365$commandDocsUrl"
    }
}

$orderedCommandSnippets = [ordered]@{}
foreach ($Item in ($commandSnippets.GetEnumerator() | Sort-Object -Property Key)) {
    $orderedCommandSnippets[$Item.Key] = $Item.Value
}
New-Object -TypeName psobject -Property $orderedCommandSnippets | ConvertTo-Json | Out-File "$PathToWorkspace\vscode-cli-microsoft365\snippets\cliForMicrosoft365.code-snippets"

$m365Model.Add('commands', $commands)
$orderedM365Model = [ordered]@{}
foreach ($Item in ($m365Model.GetEnumerator() | Sort-Object -Property Key)) {
    $orderedM365Model[$Item.Key] = $Item.Value
}
New-Object -TypeName psobject -Property $orderedM365Model | ConvertTo-Json | Out-File "$PathToWorkspace\vscode-cli-microsoft365\data\m365Model.json"
