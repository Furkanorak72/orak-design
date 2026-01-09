Write-Host "Deploy işlemi başlatılıyor..." -ForegroundColor Green

# 1. Dosyaları ekle
Write-Host "GIT ADD: Dosyalar hazırlanıyor..."
git add .

# 2. Commit oluştur
Write-Host "GIT COMMIT: 'siteyi yayına al' mesajı ile kaydediliyor..."
git commit -m "siteyi yayına al"

# 3. GitHub'a gönder
Write-Host "GIT PUSH: Kodlar GitHub'a gönderiliyor..."
git push -u origin main

Write-Host "İşlem tamamlandı!" -ForegroundColor Green
Read-Host -Prompt "Çıkmak için Enter'a basın"
