import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  content: z.string().min(10).max(20000),
});

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();

          const parsed = InputSchema.safeParse(body);

          if (!parsed.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid input",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }

          const apiKey = import.meta.env.OPENROUTER_API_KEY;

          if (!apiKey) {
            throw new Error("Missing OpenRouter API key");
          }

          const prompt = `
You are an advanced misinformation and fake-news detection AI.

Analyze the following news article deeply.

Tasks:
1. Determine if it is REAL, FAKE, MISLEADING, or UNVERIFIED.
2. Detect sensationalism.
3. Detect emotional manipulation.
4. Detect unsupported claims.
5. Evaluate credibility.
6. Explain reasoning professionally.

Return ONLY valid JSON in this exact format:

{
  "verdict": "",
  "confidence": 0,
  "summary": "",
  "reasoning": [],
  "red_flags": [],
  "supporting_signals": [],
  "credibility_score": 0,
  "fact_check_recommendation": "",
  "risk_level": ""
}

News:
${parsed.data.content}
`;

          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
              }),
            }
          );

          const data = await response.json();

          const text =
            data?.choices?.[0]?.message?.content ||
            JSON.stringify({
              verdict: "UNVERIFIED",
              confidence: 50,
              summary: "No AI response received",
            });

          return new Response(text, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              error: err.message,
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      },
    },
  },
});