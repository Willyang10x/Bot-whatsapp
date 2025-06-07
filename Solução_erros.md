# Soluções para Erros Comuns

## Erro com Puppeteer

Se você encontrar erros relacionados ao Puppeteer, tente estas soluções:

### No Linux:

Instale as dependências necessárias:

\`\`\`bash
sudo apt update
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
\`\`\`

### No Windows:

1. Certifique-se de ter o Google Chrome instalado
2. Execute como administrador

### No macOS:

\`\`\`bash
brew install --cask chromium
\`\`\`

## Erro de Conexão

Se o bot não conseguir se conectar ao WhatsApp Web:

1. Verifique sua conexão com a internet
2. Certifique-se de que seu WhatsApp está atualizado
3. Tente usar a opção `useChrome: false` nas configurações

## Erro de Autenticação

Se o QR code não aparecer ou não for reconhecido:

1. Exclua a pasta `tokens` (se existir)
2. Reinicie o bot
3. Certifique-se de que seu telefone está conectado à internet
