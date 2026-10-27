# Flash Card: quiz com IA

Aplicativo de flashcards que transforma qualquer texto de estudo em um quiz de múltipla escolha. Você cola um resumo, escolhe quantas perguntas quer e a IA gera as perguntas e respostas. Ao final da sessão, o app mostra a pontuação e guarda o seu melhor resultado.

**Site:** https://flash-card-sandy-eight.vercel.app

<!-- Adicione aqui um print ou GIF da aplicação, por exemplo:
![Tela do quiz](./docs/quiz.png)
-->

## Funcionalidades

- Geração automática de perguntas a partir de um texto colado pelo usuário
- Escolha do tamanho da sessão (4, 6, 8, 10 ou 15 perguntas)
- Quiz de múltipla escolha com feedback imediato de acerto ou erro
- Sessão sem perguntas repetidas e com alternativas embaralhadas
- Baralho padrão para jogar sem usar IA
- Placar final e estatísticas salvas no navegador (melhor percentual e total de sessões)
- Tratamento de falhas da API: nova tentativa com espera crescente e troca automática de modelo

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | React + TypeScript |
| Build e dev server | Vite |
| IA | Groq API (API compatível com o padrão OpenAI) |
| Backend | Função serverless na Vercel |
| Hospedagem | Vercel |

## Como funciona

```
Navegador (React)  ──POST /api/generate──►  Função serverless  ──►  Groq API
   tela e estado        { texto, quantidade }   guarda a chave,        gera o JSON
                                                valida e monta o prompt
```

O navegador nunca fala direto com a Groq. Ele envia o texto para `/api/generate`, e é a função serverless que usa a chave secreta, monta o prompt, chama a IA e devolve os cards.

As alternativas erradas de cada pergunta **não** são geradas pela IA: o app as monta a partir das respostas dos outros cards. Por isso o baralho precisa ter pelo menos 4 cards para exibir 4 alternativas.

## Estrutura do projeto

```
flash-card/
├── api/
│   └── generate.ts        # Backend: chama a Groq com a chave secreta
├── src/
│   ├── App.tsx            # Estado do quiz e escolha das telas
│   ├── App.css            # Estilos
│   ├── components/        # Card e Feedback (apresentação)
│   ├── Data/Deck.ts       # Baralho padrão
│   ├── Types/             # Tipos do TypeScript (Flashcard, Option...)
│   └── utils/
│       ├── aiService.ts   # Chamada do front-end para /api/generate
│       ├── cards.ts       # Sorteio, alternativas e cálculo da pontuação
│       └── storage.ts     # Estatísticas no localStorage
└── ...
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18 ou superior
- Uma chave de API da Groq, criada em [console.groq.com/keys](https://console.groq.com/keys)
- Conta na [Vercel](https://vercel.com) (gratuita), necessária para o `vercel dev`

### Passo a passo

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/wiarley-sena/flash-card.git
   cd flash-card
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```
   GROQ_API_KEY=sua_chave_aqui
   ```

   Não use o prefixo `VITE_`: variáveis com esse prefixo vão para o navegador e ficam visíveis para qualquer pessoa.

3. Rode o projeto com a CLI da Vercel, que sobe o front-end e a pasta `api/` juntos:

   ```bash
   npx vercel dev
   ```

   Na primeira vez, ela pede login e a vinculação a um projeto. Depois, abra o endereço mostrado no terminal (normalmente `http://localhost:3000`).

> O comando `npm run dev` sobe só o front-end. Como ele não executa a pasta `api/`, a geração de quiz com IA retorna 404. O baralho padrão continua funcionando.

### Outros comandos

```bash
npm run build     # gera a versão de produção
npm run lint      # verifica o código com o ESLint
```

## Deploy na Vercel

1. Envie o código para um repositório no GitHub (o `.env` já está no `.gitignore`).
2. Conecte o repositório a um projeto na Vercel.
3. Em **Settings → Environment Variables**, cadastre `GROQ_API_KEY` com a sua chave, marcando pelo menos **Production**.
4. Faça o deploy. Cada `git push` na branch `main` publica uma nova versão.

As variáveis só valem para deploys novos. Se você cadastrar a chave depois de um deploy, faça um **Redeploy**.

## Decisões de projeto

- **Chave da API fora do navegador.** Tudo o que roda no front-end pode ser lido pelo usuário, então a chamada à IA fica em uma função serverless, e a chave existe apenas no servidor.
- **Prompt e modelo definidos no servidor.** O navegador envia só o texto e a quantidade, para que ninguém use o endpoint como uma IA gratuita com prompts próprios.
- **Validação de entrada.** O backend limita o texto a 8000 caracteres e a quantidade de perguntas a 20.
- **Erros temporários e permanentes tratados de formas diferentes.** Erros 503 e 429 geram nova tentativa com espera crescente (1s, 2s, 4s). Um 404 (modelo inexistente) passa direto para o próximo modelo.
- **Efeitos colaterais fora da renderização.** A gravação das estatísticas acontece em um evento (ao terminar a sessão), e não no corpo do componente, para não ser executada mais de uma vez.

## Limitações conhecidas

- O endpoint `/api/generate` é público. Qualquer pessoa com o link pode usá-lo e consumir a cota da API.
- A resposta da IA é validada apenas de forma básica (formato de array e tamanho), sem checar cada campo.
- As estatísticas ficam no `localStorage`, ou seja, presas ao navegador e ao dispositivo.
- Não há testes automatizados.

## Próximos passos

- Limitar o número de chamadas por IP (rate limiting)
- Validar a resposta da IA em detalhe com uma biblioteca como o Zod
- Testes unitários para as funções de `cards.ts`
- Embaralhar o baralho uma vez por sessão, em vez de manter o histórico de cards usados em uma variável de módulo
- Histórico de sessões e contas de usuário, com banco de dados