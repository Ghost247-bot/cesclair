$content = [IO.File]::ReadAllText('src\app\api\products\[id]\route.ts')
$content = $content -replace 'parseInt(id)', 'idNum'
[IO.File]::WriteAllText('src\app\api\products\[id]\route.ts', $content)
