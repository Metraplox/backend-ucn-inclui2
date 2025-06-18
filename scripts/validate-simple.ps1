Write-Host "🚀 Validando sistema UCN Inclui2..." -ForegroundColor Green

# Test API
try { 
    Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Out-Null
    Write-Host "✅ API: OK" -ForegroundColor Green 
} catch { 
    Write-Host "❌ API: FAIL" -ForegroundColor Red 
}

# Test Swagger
try { 
    Invoke-WebRequest -Uri "http://localhost:3000/api" -UseBasicParsing | Out-Null
    Write-Host "✅ Swagger: OK" -ForegroundColor Green 
} catch { 
    Write-Host "❌ Swagger: FAIL" -ForegroundColor Red 
}

# Test Containers
$app = docker ps -q -f name=ucn_inclui2_production
$mongo = docker ps -q -f name=ucn_inclui2_mongodb

if ($app) { 
    Write-Host "✅ App Container: RUNNING" -ForegroundColor Green 
} else { 
    Write-Host "❌ App Container: NOT RUNNING" -ForegroundColor Red 
}

if ($mongo) { 
    Write-Host "✅ MongoDB Container: RUNNING" -ForegroundColor Green 
} else { 
    Write-Host "❌ MongoDB Container: NOT RUNNING" -ForegroundColor Red 
}

Write-Host "✅ Validación completada" -ForegroundColor Yellow 