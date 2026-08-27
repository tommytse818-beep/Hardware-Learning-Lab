$ErrorActionPreference = "Stop"

Write-Host "1/5 npm test"
npm test

Write-Host "2/5 npm run check"
npm run check

Write-Host "3/5 git diff --check"
git diff --check

Write-Host "4/5 tracked secret-name scan"
$patterns = @(
  "sb_secret_",
  "SUPABASE_SERVICE_ROLE_KEY=[^Y]",
  "RESEND_API_KEY=[^Y]"
)
foreach ($pattern in $patterns) {
  $matches = git grep -n -E $pattern -- . ':!package-lock.json' 2>$null
  if ($matches) {
    Write-Host $matches
    throw "Possible tracked secret detected for pattern: $pattern"
  }
}

Write-Host "5/5 duplicate public-asset report"
node scripts/audit-public-assets.mjs

Write-Host "Validation complete. Start the app with: npm run dev -- --port 3000"
