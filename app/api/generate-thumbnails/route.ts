import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
 try {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY सेट केलेली नाही.");
  const {prompts, ratio} = await req.json();
  if (!Array.isArray(prompts) || prompts.length !== 3) return NextResponse.json({error:"Exactly three prompts are required."},{status:400});
  const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const size = String(ratio).includes("9:16") ? "1024x1536" : String(ratio).includes("4:5") ? "1024x1536" : "1536x1024";
  const images:string[]=[];
  for (const prompt of prompts) {
   const result = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    prompt: `Create a premium social-media thumbnail background image. ${prompt}. No words, no letters, no watermark. Leave clear negative space for headline text to be overlaid accurately. Aspect ratio target: ${ratio}.`,
    size: size as "1024x1536" | "1536x1024",
    n: 1
   });
   const b64 = result.data?.[0]?.b64_json;
   if (!b64) throw new Error("Image API ने image data दिला नाही.");
   images.push(`data:image/png;base64,${b64}`);
  }
  return NextResponse.json({images});
 } catch(e) {
  const message=e instanceof Error?e.message:"Image generation failed";
  return NextResponse.json({error:message},{status:500});
 }
}
