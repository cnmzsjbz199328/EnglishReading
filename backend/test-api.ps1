# English Reading Practice API Test Script
# PowerShell Version

Write-Host "=== English Reading Practice API Test ===" -ForegroundColor Green
Write-Host "API Base URL: http://127.0.0.1:8787" -ForegroundColor Yellow
Write-Host ""

# Test function
function Test-ApiEndpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Cyan
    Write-Host "Request: $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
        }
        
        Write-Host "Success" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 1. Health Check
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/health" -Description "Basic Health Check"

# 2. Database Health Check
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/health/db" -Description "Database Health Check"

# 3. API Info
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/info" -Description "API Info and Documentation"

# 4. Get All Recordings
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/recordings" -Description "Get All Recordings"

# 5. Create New Recording
$newRecording = @{
    title = "Test Recording from PowerShell"
} | ConvertTo-Json

Test-ApiEndpoint -Method "POST" -Url "http://127.0.0.1:8787/api/recordings" -Description "Create New Recording" -Body $newRecording

# 6. Get Recording Details
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/recordings/test-123" -Description "Get Recording Details"

# 7. File Upload URL
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/upload-url/test-audio.wav" -Description "Get File Upload URL"

# 8. Batch Get Recordings
$batchRequest = @{
    ids = @("test-1", "test-2", "test-3")
} | ConvertTo-Json

Test-ApiEndpoint -Method "POST" -Url "http://127.0.0.1:8787/api/recordings/batch" -Description "Batch Get Recordings" -Body $batchRequest

# 9. Search Recordings
Test-ApiEndpoint -Method "GET" -Url "http://127.0.0.1:8787/api/recordings/search?q=english&limit=5" -Description "Search Recordings"

# 10. Delete Recording
Test-ApiEndpoint -Method "DELETE" -Url "http://127.0.0.1:8787/api/recordings/test-delete" -Description "Delete Recording"

Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host "All API endpoints have been tested!" -ForegroundColor Yellow
