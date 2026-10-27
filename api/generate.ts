import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.GROQ_API_KEY; // SEM o prefixo VITE_
  if (!apiKey) {
    return res.status(500).json({ error: "Servidor sem chave configurada." });
  }

  const { contextText, count } = req.body ?? {};
  if (typeof contextText !== "string" || !contextText.trim() || contextText.length > 8000) {
    return res.status(400).json({ error: "Texto inválido (máx. 8000 caracteres)." });
  }
  const total = Math.min(Math.max(Number(count) || 4, 1), 20);

  const systemPrompt = `Você cria flashcards de estudo em português.
Responda APENAS com um objeto JSON válido neste formato exato:
{"flashcards":[{"id":1,"question":"...","answer":"...","info":"..."}]}
"id" é um número inteiro sequencial, "info" é uma curiosidade ou explicação curta.`;

  const userPrompt = `Com base no texto abaixo, crie exatamente ${total} perguntas diferentes para flashcards de estudo, sem repetir assuntos:\n\n"${contextText}"`;

  let lastStatus = 502;
  let lastMessage = "Não foi possível gerar o quiz.";

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
        }),
      });

      if (groqRes.status === 404) break;

      if (groqRes.status === 503 || groqRes.status === 429) {
        lastStatus = groqRes.status;
        lastMessage = "A IA está sobrecarregada. Tente novamente em instantes.";
        await sleep(1000 * 2 ** (attempt - 1));
        continue;
      }

      if (!groqRes.ok) {
        console.error("Erro da Groq:", groqRes.status, await groqRes.text());
        return res.status(502).json({ error: "Erro ao falar com a IA." });
      }

      try {
        const data = await groqRes.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "");
        const cards = Array.isArray(parsed) ? parsed : parsed.flashcards;
        if (Array.isArray(cards) && cards.length > 0) {
          return res.status(200).json({ flashcards: cards });
        }
      } catch {
        // JSON inválido: tenta de novo
      }
    }
  }

  return res.status(lastStatus).json({ error: lastMessage });
}