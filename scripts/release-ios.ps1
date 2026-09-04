$ErrorActionPreference = "Stop"
npx expo-doctor
npm run typecheck
eas build --platform ios --profile production --auto-submit
