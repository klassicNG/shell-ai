import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET() {
  try {
    // This asks Google: "What models are active and free for me?"
    const response = await ai.models.list();

    // We filter for models that are "generateContent" compatible
    const models = response.models
      ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name); // We just want the names

    return NextResponse.json({
      count: models?.length,
      available_models: models,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
