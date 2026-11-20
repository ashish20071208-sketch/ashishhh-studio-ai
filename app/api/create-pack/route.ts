
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const client = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY सेट केलेली नाही. Vercel Environment Variables तपासा.");
  }
  return new OpenAI({ apiKey: key });
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const topic = String(form.get("topic") || "");
    const headline = String(form.get("headline") || "");
    const instructions = String(form.get("instructions") || "");
    const language = String(form.get("language") || "Marathi + English");
    const palette = String(form.get("palette") || "Neon contrast");
    const font = String(form.get("font") || "Mukta");
    const style = String(form.get("style") || "Cinematic");
    const ratio = String(form.get("ratio") || "YouTube 16:9");

    const carouselCount = Math.min(
      15,
      Math.max(5, Number(form.get("carouselCount") || 7))
    );

    const outputs = JSON.parse(String(form.get("outputs") || "{}"));

    const photoFiles = form
      .getAll("photos")
      .filter((x): x is File => x instanceof File);

    const photoInstructions = form.getAll("photoInstructions").map(String);

    if (!topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const photoNotes = photoFiles
      .map(
        (f, i) =>
          `Photo ${i + 1}: ${f.name}; instruction: ${
            photoInstructions[i] || "no specific instruction"
          }`
      )
      .join("\n");

    const prompt = `You are the creative director for Ashishhh Studio AI, a professional YouTube and Instagram content studio.

Create a structured content pack using ONLY claims supported by the topic brief; do not invent facts.

Output language: ${language}
TOPIC: ${topic}
USER HEADLINE: ${headline || "(suggest one)"}
GLOBAL CREATIVE INSTRUCTIONS: ${instructions || "(none)"}
PHOTO ORDER AND PER-PHOTO INSTRUCTIONS:
${photoNotes || "(no photos)"}

COLOR THEORY: ${palette}
MARATHI FONT PREFERENCE: ${font}
VISUAL STYLE: ${style}
OUTPUT FORMAT: ${ratio}
CAROUSEL SLIDES: ${carouselCount}

Respect user layout instructions. Preserve the identity and facial features in reference photos; do not alter faces. Describe how each photo should be placed.

Return JSON with exactly these keys:
design_brief (string),
thumbnails (array of exactly 3 objects with concept, headline, visual_direction, background, layout, image_prompt),
youtube_titles (array of exactly 3 strings),
tags (array of 8-15 strings),
hashtags (array of 8-15 strings),
instagram_caption (string),
carousel (array of ${outputs.carousel ? carouselCount : 0} objects with slide (number), heading, body, visual).

If an output is not selected, return an empty array or empty string for it.

outputs=${JSON.stringify(outputs)}.

Image prompts should describe a polished social media thumbnail, visual composition, negative space for accurate overlaid typography, color palette, and the supplied reference images. Do not ask the image model to render legible text.`;

    const response = await client().chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI ने रिकामा प्रतिसाद दिला.");
    }

    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

