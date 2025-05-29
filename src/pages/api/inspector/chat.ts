import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, streamToResponse } from "@/lib/openai"; // update this if you're using edge runtime

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  try {
    const messages = [
      { role: "system", content: "You are the Allora Galaxy Inspector AI. Help debug, analyze, and improve plugin behavior." },
      { role: "user", content: prompt }
    ];

    const stream = await OpenAIStream({
      model: "gpt-4",
      messages,
      stream: false,
    });

    const completion = await stream.json();
    return res.status(200).json({ response: completion.choices?.[0]?.message?.content || "No response" });
  } catch (error) {
    console.error("[Inspector Chat Error]", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
}
