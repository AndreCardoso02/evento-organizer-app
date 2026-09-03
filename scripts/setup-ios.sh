#!/usr/bin/env bash
set -euo pipefail
npm install
npx expo install --fix
npx expo-doctor
npm run typecheck
if ! command -v eas >/dev/null 2>&1; then npm install --global eas-cli; fi
eas login
eas init
echo "Setup concluído. Agora execute: npm run credentials:ios"
