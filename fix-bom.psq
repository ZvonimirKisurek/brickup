$files = @(
  "package.json",
  "bunfig.toml",
  "vite.config.ts",
  "AGENTS.md",
  "src\routes\__root.tsx",
  "src\routes\api\contact.ts"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($f in $files) {
  $content = Get-Content -Path $f -Raw -Encoding UTF8
  $fullPath = Resolve-Path $f
  [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
  Write-Host "Popravljeno: $f"
}

Write-Host ""
Write-Host "Gotovo - BOM uklonjen iz svih fajlova."