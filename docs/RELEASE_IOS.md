# Build, TestFlight e App Store Connect

## 1. Pré-requisitos

- Node.js 22.13 ou superior.
- Conta Expo.
- EAS CLI.
- Apple ID com Apple Developer Program ativo.
- App criado no App Store Connect.

## 2. Instalação

```bash
npm install
npm install --global eas-cli
npx expo install --fix
npm run doctor
npm run typecheck
```

Resolva qualquer incompatibilidade apontada pelo `expo-doctor` antes do build.

## 3. Confirmar Bundle Identifier

O projeto usa inicialmente:

```text
ao.nossoevento.app
```

O Bundle ID precisa ser único e deve ser exatamente o mesmo registrado no Apple Developer / App Store Connect. Se ele já estiver ocupado, altere `ios.bundleIdentifier` em `app.json` antes de criar as credenciais.

## 4. Associar ao projeto Expo

```bash
eas login
eas init
```

O `eas init` cria/associa o projeto no Expo e adiciona o `projectId` ao config quando necessário.

## 5. Credenciais Apple

```bash
eas credentials --platform ios
```

Selecione o perfil `production` e deixe o EAS gerenciar certificado de distribuição e provisioning profile, salvo se já possuir credenciais próprias.

Para submissões automatizadas, configure uma App Store Connect API Key pelo fluxo do EAS Credentials.

## 6. Build de teste

```bash
npm run build:ios:preview
```

Use o link gerado pelo EAS para instalar/testar de acordo com o método de distribuição configurado.

## 7. Build de produção

```bash
npm run build:ios
```

Equivalente a:

```bash
eas build --platform ios --profile production
```

O EAS incrementa o build number usando `autoIncrement` e o versionamento remoto.

## 8. Enviar para App Store Connect / TestFlight

Depois de o build terminar:

```bash
npm run submit:ios
```

ou:

```bash
eas submit --platform ios --profile production --latest
```

Na primeira vez, siga o login Apple e escolha/crie a App Store Connect API Key quando solicitado.

## 9. Build + upload em um comando

Após a configuração inicial estar concluída:

```bash
npm run release:ios
```

Isto executa um build de produção e envia o binário para o App Store Connect. O upload não publica automaticamente na App Store: o build passa primeiro pelo processamento/TestFlight e depois precisa ser selecionado numa versão da App Store e enviado para App Review.

## 10. App Store Connect

No App Store Connect:

1. Apps > + > New App.
2. Informe nome, idioma, Bundle ID e SKU.
3. Preencha App Information.
4. Configure App Privacy de acordo com o comportamento real da versão publicada.
5. Adicione URL pública da política de privacidade e suporte.
6. Crie a versão 1.0.
7. Adicione screenshots válidos dos dispositivos exigidos no portal.
8. Preencha descrição, palavras-chave, categoria, copyright e informações de revisão.
9. Aguarde o build enviado pelo EAS aparecer.
10. Selecione o build.
11. Responda às perguntas de export compliance. O projeto declara `ITSAppUsesNonExemptEncryption=false` porque não implementa criptografia própria/não isenta.
12. Clique em Add for Review / Submit for Review, conforme a interface atual do App Store Connect.

## 11. TestFlight antes da publicação

Recomenda-se instalar e testar a build processada no TestFlight antes de submetê-la para revisão pública.

## 12. Workflow EAS opcional

Existe `.eas/workflows/submit-ios.yml`. Para executar manualmente:

```bash
eas workflow:run submit-ios.yml
```

Ele cria o build iOS de produção e envia o resultado para TestFlight.

## 13. Checklist antes de enviar à Apple

- [ ] Nome final e ícone final revisados.
- [ ] Bundle Identifier pertence à tua equipa Apple.
- [ ] `npm run doctor` sem erros críticos.
- [ ] `npm run typecheck` aprovado.
- [ ] App testado em iPhone físico/TestFlight.
- [ ] Não há crashes ou botões sem ação.
- [ ] Política de privacidade publicada em URL HTTPS.
- [ ] URL de suporte publicada.
- [ ] Screenshots adicionados.
- [ ] App Privacy preenchido de acordo com a versão real.
- [ ] Informações de revisão preenchidas.
- [ ] Build selecionado na versão.

## 14. Scripts prontos para Windows

No PowerShell, a partir da raiz do projeto:

```powershell
./scripts/setup-ios.ps1
npm run credentials:ios
./scripts/build-ios.ps1
./scripts/submit-ios.ps1
```

Para versões futuras, depois de tudo configurado:

```powershell
./scripts/release-ios.ps1
```
