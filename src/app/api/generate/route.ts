import { NextResponse } from "next/server";
import { buildAIPayload, mockGenerateGraphic } from "@/lib/generator";
import { GenerateResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const { prompt, color } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!color || typeof color !== "string") {
      return NextResponse.json({ error: "Primary color is required" }, { status: 400 });
    }

    const payload = buildAIPayload(prompt, color);

    // TODO: Replace the mock below with a real AI/vector generation call using `payload`.
    // Example:
    // const result = await callYourModelAPI(payload, process.env.GRAPHICS_MODEL_API_KEY);
    // const graphic: GeneratedGraphic = normalizeModelResponse(result, prompt, color);
    const graphic = mockGenerateGraphic(prompt, color);

    const response: GenerateResponse & { payload: typeof payload } = {
      graphic,
      payload,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("/api/generate error", error);
    return NextResponse.json(
      { error: "Unable to generate graphic. Please try again." },
      { status: 500 },
    );
  }
}
