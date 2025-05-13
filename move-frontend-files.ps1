$sourceDir = "C:\Users\burgh\Desktop\Emmel-Next-GitHub Codespaces"
$targetDir = "C:\Users\burgh\Desktop\Emmel-Next-Frontend-To-Remove"

# Create directories structure in the target folder
function EnsureDirectoryExists {
    param([string]$path)
    
    if (-not (Test-Path $path)) {
        New-Item -Path $path -ItemType Directory -Force
    }
}

# Components - UI
$componentsUIPath = Join-Path $targetDir "src\components\UI"
EnsureDirectoryExists $componentsUIPath
Get-ChildItem -Path "$sourceDir\src\components\UI" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $componentsUIPath
}

# Components - Layout
$componentsLayoutPath = Join-Path $targetDir "src\components\Layout"
EnsureDirectoryExists $componentsLayoutPath
Get-ChildItem -Path "$sourceDir\src\components\Layout" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $componentsLayoutPath
}

# Components - Forms
$componentsFormsPath = Join-Path $targetDir "src\components\Forms"
EnsureDirectoryExists $componentsFormsPath
Get-ChildItem -Path "$sourceDir\src\components\Forms" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $componentsFormsPath
}

# Components - Drivers
$componentsDriversPath = Join-Path $targetDir "src\components\Drivers"
EnsureDirectoryExists $componentsDriversPath
Get-ChildItem -Path "$sourceDir\src\components\Drivers" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $componentsDriversPath
}

# Context
$contextPath = Join-Path $targetDir "src\context"
EnsureDirectoryExists $contextPath
Get-ChildItem -Path "$sourceDir\src\context" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $contextPath
}

# Hooks (except API-related)
$hooksPath = Join-Path $targetDir "src\hooks"
EnsureDirectoryExists $hooksPath
Get-ChildItem -Path "$sourceDir\src\hooks" -File | Where-Object { $_.Name -ne "useApi.ts" } | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $hooksPath
}

# Styles
$stylesPath = Join-Path $targetDir "src\styles"
EnsureDirectoryExists $stylesPath
Get-ChildItem -Path "$sourceDir\src\styles" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $stylesPath
}

# App pages and layouts (preserving API routes)
$appPages = @(
    "layout.tsx",
    "page.tsx",
    "bookings/page.tsx",
    "business-customers/page.tsx",
    "calendar/page.tsx",
    "customers/page.tsx",
    "dashboard/page.tsx",
    "drivers/page.tsx",
    "fleet/[id]/page.tsx",
    "fleet/buses/page.tsx",
    "fleet/maintenance/page.tsx",
    "fleet/new/page.tsx",
    "help/page.tsx",
    "individual-customers/page.tsx",
    "login/layout.tsx",
    "login/page.tsx",
    "register/page.tsx",
    "reports/page.tsx",
    "settings/page.tsx",
    "trips/map/page.tsx",
    "trips/page.tsx"
)

foreach ($page in $appPages) {
    $sourcePath = Join-Path $sourceDir "src\app\$page"
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path $targetDir "src\app\$page"
        $targetFolder = Split-Path -Parent $targetPath
        EnsureDirectoryExists $targetFolder
        Move-Item -Path $sourcePath -Destination $targetPath
    }
}

# CSS files
$cssSourcePath = Join-Path $sourceDir "src\app\globals.css"
if (Test-Path $cssSourcePath) {
    $cssTargetPath = Join-Path $targetDir "src\app"
    EnsureDirectoryExists $cssTargetPath
    Move-Item -Path $cssSourcePath -Destination $cssTargetPath
}

# Create placeholder files for essential structure
$essentialFiles = @(
    "src\app\layout.tsx",
    "src\app\page.tsx",
    "src\app\globals.css"
)

foreach ($file in $essentialFiles) {
    $filePath = Join-Path $sourceDir $file
    if (-not (Test-Path $filePath)) {
        $directory = Split-Path -Parent $filePath
        if (-not (Test-Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force
        }
        
        $content = "// Placeholder file created during frontend rebuild"
        if ($file -like "*.css") {
            $content = "/* Base styles */
@tailwind base;
@tailwind components;
@tailwind utilities;"
        }
        
        Set-Content -Path $filePath -Value $content
    }
}

Write-Host "Frontend files have been moved to $targetDir"
Write-Host "Please review the files and delete the temporary directory when ready."
