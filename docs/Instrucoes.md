# 🤖 Bot de Enquetes WhatsApp

## 🚀 Como executar

1. **Instalar dependências:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Executar o bot:**
   \`\`\`bash
   npm start
   \`\`\`

3. **Escanear QR Code:**
   - Um navegador será aberto automaticamente
   - Escaneie o QR code com seu WhatsApp
   - Aguarde a mensagem "Bot conectado com sucesso!"

## 📱 Como usar

### Comandos disponíveis:
- \`enquete\` - Ver/iniciar a enquete ativa
- \`1\`, \`2\`, \`3\` - Votar nas opções
- \`resultado\` - Ver resultado atual
- \`ajuda\` - Lista de comandos
- \`resetar\` - Limpar votos (apenas admin)

### Opções da enquete:
1️⃣ Pizza 🍕
2️⃣ Hambúrguer 🍔  
3️⃣ Salada 🥗

## 🔧 Solução de problemas

### Se o navegador não abrir:
1. Feche o terminal (Ctrl+C)
2. Execute novamente: \`npm start\`
3. Aguarde alguns segundos

### Se der erro de conexão:
1. Verifique sua internet
2. Certifique-se que o WhatsApp está funcionando
3. Tente reiniciar o bot

### Se o QR code não aparecer:
1. Verifique se há algum antivírus bloqueando
2. Execute como administrador (Windows)
3. Tente usar outro navegador como padrão

## 📊 Recursos

- ✅ Controle de voto único por usuário
- ✅ Salvamento automático em CSV
- ✅ Recuperação de votos ao reiniciar
- ✅ Interface amigável com emojis
- ✅ Comandos de administrador
- ✅ Logs detalhados no terminal
