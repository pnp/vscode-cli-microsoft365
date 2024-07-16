param (
    [Parameter(Mandatory = $true)]
    [string]$PathToWorkspace
)

$allSamples = Get-ChildItem -Path "$PathToWorkspace\script-samples\scripts\**\sample.json" -Recurse -Force
$allCLiSamples = Get-ChildItem -Path "$PathToWorkspace\cli-microsoft365\docs\docs\**\sample.json" -Recurse -Force

[hashtable]$sampleModel = @{}
$samples = @()

foreach ($sample in $allSamples) {
    $sampleContent = Get-Content -Path $sample.FullName -Raw
    $sampleJson = ConvertFrom-Json -InputObject $sampleContent
    if ($sampleJson.metadata.Where({ $_.key -eq 'CLI-FOR-MICROSOFT365' }, 'First').Count -eq 0) {
        continue
    }

    if ($sampleJson.name -eq '<foldername>') {
        continue
    }

    $readme = $sample.FullName.Replace('assets\sample.json', 'README.md')
    $readmeContent = Get-Content -Path $readme -Raw
    $type = @()
    $tabTag = @()
    if ($readmeContent.Contains("#tab/cli-m365-ps")) {
        $type += 'powershell'
        $tabTag += '#tab/cli-m365-ps'
    }
    
    if ($readmeContent.Contains("#tab/cli-m365-bash")) {
        $type += 'bash'
        $tabTag += '#tab/cli-m365-bash'
    }

    if ($readmeContent.Contains("#tab/m365cli-bash")) {
        $type += 'bash'
        $tabTag += '#tab/m365cli-bash'
    }
    
    $rawUrl = $sampleJson.url
    $rawUrl = $rawUrl.Replace('https://pnp.github.io/script-samples', 'https://raw.githubusercontent.com/pnp/script-samples/main/scripts')
    $rawUrl = $rawUrl.Replace('.html', '.md')
    
    $sampleAuthors = @()
    foreach($author in $sampleJson.authors) {
        $sampleAuthors += [pscustomobject]@{ 
            name        = $author.name;
            pictureUrl  = $author.pictureUrl;
        }
    }

    $samples += [pscustomobject]@{
        title       = $sampleJson.title; 
        url         = $sampleJson.url; 
        rawUrl      = $rawUrl; 
        description = $sampleJson.shortDescription; 
        image       = $sampleJson.thumbnails[0].url; 
        type        = $type;
        tabTag      = $tabTag;
        authors     = $sampleAuthors;
        tags        = $sampleJson.tags;
        createDate  = $sampleJson.creationDateTime;
        source      = 'script-samples'
    }
}

foreach ($sample in $allCLiSamples) {
    $sampleContent = Get-Content -Path $sample.FullName -Raw
    $sampleJson = ConvertFrom-Json -InputObject $sampleContent
    
    $index = $sample.FullName.Replace('assets\sample.json', 'index.mdx')
    $indexContent = Get-Content -Path $index -Raw
    $type = @()
    $tabTag = @()

    if ($indexContent.Contains('```powershell')) {
        $type += 'powershell'
        $tabTag += '```powershell'
    }
    
    if ($indexContent.Contains('```bash')) {
        $type += 'bash'
        $tabTag += '```bash'
    }
    
    if ($indexContent.Contains('```javascript')) {
        $type += 'javascript'
        $tabTag += '```javascript'
    }

    $rawUrl = $sampleJson.url
    $rawUrl = $rawUrl.Replace('https://pnp.github.io/cli-microsoft365/sample-scripts/', 'https://raw.githubusercontent.com/pnp/cli-microsoft365/main/docs/docs/sample-scripts/')
    $rawUrl = "$rawUrl/index.mdx"
    
    $sampleAuthors = @()
    foreach($author in $sampleJson.authors) {
        $sampleAuthors += [pscustomobject]@{ 
            name        = $author.name;
            pictureUrl  = $author.pictureUrl;
        }
    }

    $samples += [pscustomobject]@{
        title       = $sampleJson.title; 
        url         = $sampleJson.url; 
        rawUrl      = $rawUrl; 
        description = $sampleJson.shortDescription; 
        image       = $sampleJson.thumbnails[0].url; 
        type        = $type;
        tabTag      = $tabTag;
        authors     = $sampleAuthors;
        tags        = $sampleJson.tags;
        createDate  = $sampleJson.creationDateTime;
        source      = 'cli'
    }
}

$sampleModel.Add('samples', $samples)
$orderedSampleModel = [ordered]@{}
foreach ($Item in ($sampleModel.GetEnumerator() | Sort-Object -Property Key)) {
    $orderedSampleModel[$Item.Key] = $Item.Value
}
New-Object -TypeName psobject -Property $orderedSampleModel | ConvertTo-Json -Depth 10 | Out-File "$PathToWorkspace\vscode-cli-microsoft365\data\samples.json"
