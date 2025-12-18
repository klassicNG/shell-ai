import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Linux Command Line expert. 
          Task: Translate requests to Bash.
          Rules:
          1. Output ONLY the code. No markdown, no explanations.
          2. If the command is DESTRUCTIVE (delete, format, kill, rm -rf), prefix it with "WARNING: ".
             Example: "WARNING: rm -rf /"
          3. Otherwise, just output the command.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // UPDATED MODEL NAME BELOW:
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 200,
    });

    const command = completion.choices[0]?.message?.content || "# Error";

    return NextResponse.json({ command });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json(
      { error: "Failed to generate command" },
      { status: 500 }
    );
  }
}
