import type { NextApiRequest, NextApiResponse } from "next";
import { generateOpenAIResponse } from "@/lib/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  try {
    const messages = [
      { role: "system", content: "You are the Allora Galaxy Inspector AI. Help debug, analyze, and improve plugin behavior." },
      { role: "user", content: prompt }
    ];

    const completion = await generateOpenAIResponse({
      model: "gpt-4",
      messages,
      stream: false,
    });

    return res.status(200).json({ response: completion.choices?.[0]?.message?.content || "No response" });
  } catch (error) {
    console.error("[Inspector Chat Error]", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
}
