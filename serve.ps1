# Мінімальний статичний сервер для локального перегляду Marielle
# Запуск:  powershell -ExecutionPolicy Bypass -File serve.ps1
param([string]$Root = $PSScriptRoot, [int]$Port = 8788)
if (-not $Root) { $Root = (Get-Location).Path }

$types = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="application/javascript; charset=utf-8"; ".svg"="image/svg+xml";
  ".json"="application/json; charset=utf-8"; ".png"="image/png"; ".jpg"="image/jpeg";
  ".jpeg"="image/jpeg"; ".webp"="image/webp"; ".avif"="image/avif"; ".ico"="image/x-icon";
  ".pdf"="application/pdf"; ".woff2"="font/woff2"; ".woff"="font/woff";
  ".txt"="text/plain; charset=utf-8"; ".md"="text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "SERVING $Root on http://localhost:$Port/"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $Root ($path.TrimStart("/") -replace "/", "\")

    if (Test-Path -LiteralPath $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = $types[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $ct
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 not found: $path")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    Write-Output ("ERR: " + $_.Exception.Message)
  }
}
