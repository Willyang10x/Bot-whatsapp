const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const fs = require("fs")
const axios = require("axios")
const QRCode = require("qrcode")

//Dados do usuário//
let userData = {}
let lembretes = []
let notas = {}

function carregarDados() {
  try {
    if (fs.existsSync("./dados_usuario.json")) {
      const dados = fs.readFileSync("./dados_usuario.json", "utf8")
      userData = JSON.parse(dados)
    }
    if (fs.existsSync("./lembretes.json")) {
      const dados = fs.readFileSync("./lembretes.json", "utf8")
      lembretes = JSON.parse(dados)
    }
    if (fs.existsSync("./notas.json")) {
      const dados = fs.readFileSync("./notas.json", "utf8")
      notas = JSON.parse(dados)
    }
    console.log("✅ Dados carregados com sucesso!")
  } catch (erro) {
    console.error("❌ Erro ao carregar dados:", erro.message)
  }
}

//Salvar dados//
function salvarDados() {
  try {
    fs.writeFileSync("./dados_usuario.json", JSON.stringify(userData, null, 2))
    fs.writeFileSync("./lembretes.json", JSON.stringify(lembretes, null, 2))
    fs.writeFileSync("./notas.json", JSON.stringify(notas, null, 2))
  } catch (erro) {
    console.error("❌ Erro ao salvar dados:", erro.message)
  }
}

//Funções utilitárias//
const utils = {
  async consultarCEP(cep) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      return response.data
    } catch (erro) {
      return null
    }
  },

  //Consultar clima//
  async consultarClima(cidade) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=SUA_CHAVE_API&units=metric&lang=pt_br`,
      )
      return response.data
    } catch (erro) {
      return null
    }
  },

  //Gerar senha segura//
  gerarSenha(tamanho = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let senha = ""
    for (let i = 0; i < tamanho; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return senha
  },

  //Calcular porcentagem//
  calcularPorcentagem(valor, porcentagem, tipo = "de") {
    if (tipo === "de") {
      return (valor * porcentagem) / 100
    } else if (tipo === "desconto") {
      return valor - (valor * porcentagem) / 100
    } else if (tipo === "acrescimo") {
      return valor + (valor * porcentagem) / 100
    }
  },

  //Validar CPF//
  validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "")
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false

    const cpfArray = cpf.split("").map((el) => +el)
    const rest = (count) => {
      return (
        ((cpfArray.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11) % 10
      )
    }
    return rest(10) === cpfArray[9] && rest(11) === cpfArray[10]
  },

  //Encurtar URL (simulado)//
  encurtarURL(url) {
    const id = Math.random().toString(36).substr(2, 8)
    return `https://short.ly/${id}`
  },

  //Gerar QR Code//
  async gerarQRCode(texto) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(texto)
      return qrCodeDataURL
    } catch (erro) {
      return null
    }
  },
}

//Criar cliente WhatsApp//
const client = new Client({
  authStrategy: new LocalAuth({
    name: "assistente-bot",
  }),
  puppeteer: {
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
})

//Eventos do cliente//
client.on("qr", (qr) => {
  console.log("📱 Escaneie o QR Code abaixo:")
  console.log("=".repeat(50))
  qrcode.generate(qr, { small: true })
  console.log("=".repeat(50))
})

client.on("ready", () => {
  console.log("🤖 Assistente Pessoal WhatsApp conectado!")
  console.log("🚀 Bot pronto para facilitar sua vida!")
  console.log("=".repeat(50))
  carregarDados()

  //Verificar lembretes a cada minuto//
  setInterval(verificarLembretes, 60000)
})

client.on("authenticated", () => {
  console.log("🔐 Autenticação realizada!")
})

//Verificar lembretes//
function verificarLembretes() {
  const agora = new Date()
  lembretes.forEach((lembrete, index) => {
    const dataLembrete = new Date(lembrete.data)
    if (dataLembrete <= agora && !lembrete.enviado) {
      client.sendMessage(
        lembrete.usuario,
        `⏰ *LEMBRETE!*\n\n📝 ${lembrete.texto}\n\n🕐 Agendado para: ${dataLembrete.toLocaleString("pt-BR")}`,
      )
      lembretes[index].enviado = true
      salvarDados()
    }
  })
}

//Manipulador de mensagens//
client.on("message", async (mensagem) => {
  try {
    const remetente = mensagem.from
    const texto = mensagem.body.toLowerCase().trim()
    const contato = await mensagem.getContact()
    const nomeContato = contato.pushname || contato.name || "Usuário"

    console.log(`📨 ${nomeContato}: ${texto}`)

    //Comando: Menu principal//
    if (texto === "menu" || texto === "ajuda" || texto === "start") {
      const menuPrincipal =
        "🤖 *ASSISTENTE PESSOAL WHATSAPP* 🤖\n\n" +
        "🔧 *FERRAMENTAS ÚTEIS:*\n" +
        "• `cep [número]` - Consultar endereço\n" +
        "• `clima [cidade]` - Previsão do tempo\n" +
        "• `senha [tamanho]` - Gerar senha segura\n" +
        "• `cpf [número]` - Validar CPF\n" +
        "• `calc [expressão]` - Calculadora\n" +
        "• `% [valor] [porcentagem]` - Calcular %\n" +
        "• `qr [texto]` - Gerar QR Code\n" +
        "• `encurtar [url]` - Encurtar URL\n\n" +
        "📝 *ORGANIZAÇÃO:*\n" +
        "• `lembrete [data] [texto]` - Criar lembrete\n" +
        "• `nota [título] [texto]` - Salvar nota\n" +
        "• `notas` - Ver todas as notas\n" +
        "• `lembretes` - Ver lembretes ativos\n\n" +
        "💰 *FINANCEIRO:*\n" +
        "• `desconto [valor] [%]` - Calcular desconto\n" +
        "• `acrescimo [valor] [%]` - Calcular acréscimo\n" +
        "• `split [valor] [pessoas]` - Dividir conta\n\n" +
        "📊 *ENQUETES:*\n" +
        "• `enquete` - Criar enquete rápida\n" +
        "• `votar [opção]` - Votar em enquete\n" +
        "• `resultado` - Ver resultado\n\n" +
        "💡 *Digite qualquer comando para começar!*"

      await client.sendMessage(remetente, menuPrincipal)
    }

    //Consultar CEP//
    else if (texto.startsWith("cep ")) {
      const cep = texto.replace("cep ", "").replace(/\D/g, "")
      if (cep.length === 8) {
        const endereco = await utils.consultarCEP(cep)
        if (endereco && !endereco.erro) {
          const resposta =
            `📍 *ENDEREÇO ENCONTRADO*\n\n` +
            `🏠 **Logradouro:** ${endereco.logradouro}\n` +
            `🏘️ **Bairro:** ${endereco.bairro}\n` +
            `🏙️ **Cidade:** ${endereco.localidade}\n` +
            `🗺️ **Estado:** ${endereco.uf}\n` +
            `📮 **CEP:** ${endereco.cep}\n` +
            `📞 **DDD:** ${endereco.ddd}`

          await client.sendMessage(remetente, resposta)
        } else {
          await client.sendMessage(remetente, "❌ CEP não encontrado! Verifique o número.")
        }
      } else {
        await client.sendMessage(remetente, "❌ CEP inválido! Use o formato: `cep 12345678`")
      }
    }

    //Gerar senha//
    else if (texto.startsWith("senha")) {
      const tamanho = Number.parseInt(texto.replace("senha", "").trim()) || 12
      if (tamanho >= 4 && tamanho <= 50) {
        const senha = utils.gerarSenha(tamanho)
        await client.sendMessage(
          remetente,
          `🔐 *SENHA GERADA*\n\n` +
            `🔑 **Senha:** \`${senha}\`\n` +
            `📏 **Tamanho:** ${tamanho} caracteres\n` +
            `🛡️ **Segurança:** Alta\n\n` +
            `⚠️ *Guarde em local seguro!*`,
        )
      } else {
        await client.sendMessage(remetente, "❌ Tamanho inválido! Use entre 4 e 50 caracteres.")
      }
    }

    //Validar CPF//
    else if (texto.startsWith("cpf ")) {
      const cpf = texto.replace("cpf ", "")
      const valido = utils.validarCPF(cpf)
      const resposta = valido
        ? `✅ *CPF VÁLIDO*\n\n📄 **CPF:** ${cpf}\n🎯 **Status:** Válido`
        : `❌ *CPF INVÁLIDO*\n\n📄 **CPF:** ${cpf}\n🎯 **Status:** Inválido`

      await client.sendMessage(remetente, resposta)
    }

    // Calculadora//
    else if (texto.startsWith("calc ")) {
      try {
        const expressao = texto.replace("calc ", "")
        const expressaoLimpa = expressao.replace(/[^0-9+\-*/().,\s]/g, "")
        const resultado = eval(expressaoLimpa)

        await client.sendMessage(
          remetente,
          `🧮 *CALCULADORA*\n\n` +
            `📝 **Expressão:** ${expressao}\n` +
            `🎯 **Resultado:** ${resultado}\n\n` +
            `💡 *Exemplo: calc 10 + 5 * 2*`,
        )
      } catch (erro) {
        await client.sendMessage(remetente, "❌ Expressão inválida! Exemplo: `calc 10 + 5 * 2`")
      }
    }

    //Calcular porcentagem//
    else if (texto.startsWith("% ")) {
      const partes = texto.replace("% ", "").split(" ")
      if (partes.length >= 2) {
        const valor = Number.parseFloat(partes[0])
        const porcentagem = Number.parseFloat(partes[1])
        const resultado = utils.calcularPorcentagem(valor, porcentagem)

        await client.sendMessage(
          remetente,
          `📊 *CÁLCULO DE PORCENTAGEM*\n\n` +
            `💰 **Valor:** R$ ${valor.toFixed(2)}\n` +
            `📈 **Porcentagem:** ${porcentagem}%\n` +
            `🎯 **${porcentagem}% de ${valor}:** R$ ${resultado.toFixed(2)}`,
        )
      } else {
        await client.sendMessage(remetente, "❌ Use: `% 100 15` (15% de 100)")
      }
    }

    //Calcular desconto//
    else if (texto.startsWith("desconto ")) {
      const partes = texto.replace("desconto ", "").split(" ")
      if (partes.length >= 2) {
        const valor = Number.parseFloat(partes[0])
        const desconto = Number.parseFloat(partes[1])
        const valorDesconto = utils.calcularPorcentagem(valor, desconto)
        const valorFinal = utils.calcularPorcentagem(valor, desconto, "desconto")

        await client.sendMessage(
          remetente,
          `💸 *CÁLCULO DE DESCONTO*\n\n` +
            `💰 **Valor original:** R$ ${valor.toFixed(2)}\n` +
            `📉 **Desconto:** ${desconto}%\n` +
            `💵 **Valor do desconto:** R$ ${valorDesconto.toFixed(2)}\n` +
            `🎯 **Valor final:** R$ ${valorFinal.toFixed(2)}\n\n` +
            `💡 *Você economiza R$ ${valorDesconto.toFixed(2)}!*`,
        )
      } else {
        await client.sendMessage(remetente, "❌ Use: `desconto 100 20` (20% de desconto em R$ 100)")
      }
    }

    //Dividir conta//
    else if (texto.startsWith("split ")) {
      const partes = texto.replace("split ", "").split(" ")
      if (partes.length >= 2) {
        const valor = Number.parseFloat(partes[0])
        const pessoas = Number.parseInt(partes[1])
        const valorPorPessoa = valor / pessoas

        await client.sendMessage(
          remetente,
          `🍽️ *DIVIDIR CONTA*\n\n` +
            `💰 **Valor total:** R$ ${valor.toFixed(2)}\n` +
            `👥 **Pessoas:** ${pessoas}\n` +
            `🎯 **Valor por pessoa:** R$ ${valorPorPessoa.toFixed(2)}\n\n` +
            `💡 *Cada um paga R$ ${valorPorPessoa.toFixed(2)}*`,
        )
      } else {
        await client.sendMessage(remetente, "❌ Use: `split 120 4` (R$ 120 para 4 pessoas)")
      }
    }

    //Criar lembrete//
    else if (texto.startsWith("lembrete ")) {
      const conteudo = texto.replace("lembrete ", "")
      const partes = conteudo.split(" ")

      if (partes.length >= 3) {
        const data = partes[0]
        const hora = partes[1]
        const textoLembrete = partes.slice(2).join(" ")

        try {
          const [dia, mes, ano] = data.split("/")
          const [h, m] = hora.split(":")
          const dataLembrete = new Date(ano, mes - 1, dia, h, m)

          lembretes.push({
            id: Date.now(),
            usuario: remetente,
            data: dataLembrete.toISOString(),
            texto: textoLembrete,
            enviado: false,
          })

          salvarDados()

          await client.sendMessage(
            remetente,
            `⏰ *LEMBRETE CRIADO*\n\n` +
              `📝 **Texto:** ${textoLembrete}\n` +
              `📅 **Data:** ${dataLembrete.toLocaleString("pt-BR")}\n\n` +
              `✅ *Você será notificado no horário!*`,
          )
        } catch (erro) {
          await client.sendMessage(remetente, "❌ Formato inválido! Use: `lembrete 25/12/2024 14:30 Texto do lembrete`")
        }
      } else {
        await client.sendMessage(remetente, "❌ Use: `lembrete 25/12/2024 14:30 Reunião importante`")
      }
    }

    //Ver lembretes//
    else if (texto === "lembretes") {
      const lembretesAtivos = lembretes.filter((l) => l.usuario === remetente && !l.enviado)

      if (lembretesAtivos.length > 0) {
        let resposta = "⏰ *SEUS LEMBRETES ATIVOS*\n\n"
        lembretesAtivos.forEach((lembrete, index) => {
          const data = new Date(lembrete.data)
          resposta += `${index + 1}. 📝 ${lembrete.texto}\n`
          resposta += `   📅 ${data.toLocaleString("pt-BR")}\n\n`
        })
        await client.sendMessage(remetente, resposta)
      } else {
        await client.sendMessage(remetente, "📭 Você não tem lembretes ativos.")
      }
    }

    //Salvar nota//
    else if (texto.startsWith("nota ")) {
      const conteudo = texto.replace("nota ", "")
      const partes = conteudo.split(" ")

      if (partes.length >= 2) {
        const titulo = partes[0]
        const textoNota = partes.slice(1).join(" ")

        if (!notas[remetente]) notas[remetente] = {}
        notas[remetente][titulo] = {
          texto: textoNota,
          data: new Date().toISOString(),
        }

        salvarDados()

        await client.sendMessage(
          remetente,
          `📝 *NOTA SALVA*\n\n` +
            `🏷️ **Título:** ${titulo}\n` +
            `📄 **Texto:** ${textoNota}\n` +
            `📅 **Data:** ${new Date().toLocaleString("pt-BR")}`,
        )
      } else {
        await client.sendMessage(remetente, "❌ Use: `nota titulo Texto da sua nota aqui`")
      }
    }

    //Ver notas//
    else if (texto === "notas") {
      const notasUsuario = notas[remetente]

      if (notasUsuario && Object.keys(notasUsuario).length > 0) {
        let resposta = "📝 *SUAS NOTAS*\n\n"
        Object.entries(notasUsuario).forEach(([titulo, nota]) => {
          const data = new Date(nota.data)
          resposta += `🏷️ **${titulo}**\n`
          resposta += `📄 ${nota.texto}\n`
          resposta += `📅 ${data.toLocaleDateString("pt-BR")}\n\n`
        })
        await client.sendMessage(remetente, resposta)
      } else {
        await client.sendMessage(remetente, "📭 Você não tem notas salvas.")
      }
    }

    //Gerar QR Code//
    else if (texto.startsWith("qr ")) {
      const textoQR = texto.replace("qr ", "")
      try {
        const qrCodeDataURL = await utils.gerarQRCode(textoQR)
        if (qrCodeDataURL) {
          const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "")
          const media = new MessageMedia("image/png", base64Data, "qrcode.png")

          await client.sendMessage(remetente, media, `📱 *QR CODE GERADO*\n\n📝 **Conteúdo:** ${textoQR}`)
        }
      } catch (erro) {
        await client.sendMessage(remetente, "❌ Erro ao gerar QR Code!")
      }
    }

    //Saudações//
    else if (["oi", "olá", "hello", "hi", "ola"].includes(texto)) {
      await client.sendMessage(
        remetente,
        `👋 Olá, ${nomeContato}!\n\n` +
          "🤖 Eu sou seu **Assistente Pessoal WhatsApp**!\n\n" +
          "🚀 Posso ajudar você com:\n" +
          "• 📍 Consultas de CEP\n" +
          "• 🔐 Geração de senhas\n" +
          "• 🧮 Cálculos diversos\n" +
          "• ⏰ Lembretes\n" +
          "• 📝 Anotações\n" +
          "• 💰 Cálculos financeiros\n" +
          "• E muito mais!\n\n" +
          "💡 Digite **menu** para ver todos os comandos!",
      )
    }

    //Comando não reconhecido//
    else {
      await client.sendMessage(
        remetente,
        "🤔 Comando não reconhecido!\n\n" +
          "💡 Digite **menu** para ver todos os comandos disponíveis.\n\n" +
          "🚀 Exemplos rápidos:\n" +
          "• `cep 01310100`\n" +
          "• `senha 12`\n" +
          "• `calc 10 + 5`\n" +
          "• `% 100 15`",
      )
    }
  } catch (erro) {
    console.error("❌ Erro:", erro.message)
    await client.sendMessage(remetente, "❌ Ops! Ocorreu um erro. Tente novamente.")
  }
})

console.log("🚀 Iniciando Assistente Pessoal WhatsApp...")
console.log("👤 Administrador: +55 83 98868-8864")
console.log("=".repeat(50))

client.initialize()
