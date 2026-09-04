# Nosso Evento

Aplicativo React Native + Expo para organização financeira e operacional de um evento.

## Stack

- Expo SDK 57
- React 19.2
- React Native 0.86
- TypeScript
- AsyncStorage
- EAS Build / EAS Submit

## Desenvolvimento

```bash
npm install
npx expo install --fix
npm run doctor
npm start
```

## iOS / App Store

Leia **docs/RELEASE_IOS.md**.

Comandos principais:

```bash
npm install --global eas-cli
eas login
eas init
npm run credentials:ios
npm run build:ios
npm run submit:ios
```

Para futuras versões, após as credenciais estarem prontas:

```bash
npm run release:ios
```

## Importante antes de publicar

- Confirme que `ao.nossoevento.app` está disponível e pertence à tua equipa Apple.
- Substitua as URLs/contato em `docs/APP_STORE_METADATA.md` e `docs/PRIVACY_POLICY.md`.
- Publique a política de privacidade numa URL HTTPS.
- Faça `eas init` para associar o projeto à conta Expo correta.
- Nunca versione certificados, `.p8`, senhas, tokens ou `.env` com segredos.
