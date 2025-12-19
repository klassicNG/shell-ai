import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json();

    let systemPrompt = "";

    if (mode === "explain") {
      systemPrompt = `You are a Linux Teacher.
      Task: Explain the given Bash command in simple English.
      Rules:
      1. Be concise (max 2 sentences).
      2. Explain what the command does generally.
      3. Briefly mention what specific flags do (e.g., "-r means recursive").
      4. If the command is dangerous, start with "⚠️ DANGER: ".`;
    } else {
      systemPrompt = `You are a Linux Command Line expert. 
      Task: Translate requests to Bash.
      Rules:
      1. Output ONLY the code. No markdown, no explanations.
      2. If the command is DESTRUCTIVE (delete, format, kill, rm -rf), prefix it with "WARNING: ".
      3. Otherwise, just output the command.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 300,
    });

    const command = completion.choices[0]?.message?.content || "# Error";

    // --- SAVE TO SUPABASE ---
    if (!command.includes("Error") && !command.startsWith("#")) {
      // We use a different variable name here 'dbError' to avoid conflicts
      const { error: dbError } = await supabase.from("history").insert({
        prompt: prompt,
        command: command,
        mode: mode || "gen",
      });

      if (dbError) {
        console.error("🔴 Supabase Write Error:", dbError.message);
      } else {
        console.log("🟢 Saved to Supabase successfully!");
      }
    }
    // ------------------------

    return NextResponse.json({ command });

  } catch (error: any) { 
    // ^ We name this 'error' explicitly so the console.log below works
    console.error("Groq/Server Error:", error);
    return NextResponse.json(
      { error: "Failed to generate command" },
      { status: 500 }
    );
  }
}