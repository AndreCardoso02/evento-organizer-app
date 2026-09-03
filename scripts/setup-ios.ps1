$ErrorActionPreference = "Stop"

Write-Host "[1/5] Instalando dependencias..."
npm install

Write-Host "[2/5] Ajustando dependencias ao Expo SDK..."
npx expo install --fix

Write-Host "[3/5] Verificando projeto..."
npx expo-doctor
npm run typecheck

Write-Host "[4/5] Login no Expo/EAS..."
$eassh = Get-Command eas -ErrorAction SilentlyContinue
if (-not $eassh) {
  npm install --global eas-cli
}
eas login

Write-Host "[5/5] Associando projeto ao EAS..."
eas init

Write-Host "Setup concluido. Agora execute: npm run credentials:ios"
