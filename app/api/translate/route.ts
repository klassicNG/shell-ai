import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              // ... inside your prompt text ...
              text: `You are a Linux Command Line expert. 
                Task: Translate the user's request into a valid bash command.
                
                Rules:
                1. Output ONLY the code.
                2. If the command is DESTRUCTIVE (delete, format, kill, rm -rf, dd, chmod 777), prefix the output with "WARNING: " followed by the command.
                   Example: "WARNING: rm -rf /"
                3. Otherwise, just output the command.
                
                User Request: "${prompt}"`,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 700, // Increased from 100 to 500 to prevent cut-offs
        temperature: 0.1, // Keep it precise
      },
    });

    const command = response.text?.trim() || "# Error: No command generated";

    return NextResponse.json({ command });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate command" },
      { status: 500 }
    );
  }
}
