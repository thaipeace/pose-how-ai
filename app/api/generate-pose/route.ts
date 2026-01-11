import { NextRequest, NextResponse } from "next/server";
import { getActiveSession } from "../analyze/route";

export async function POST(req: NextRequest) {
  // Tạo một controller để có thể hủy request nếu cần
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 15 giây timeout

  try {
    // 1. Phải await req.json() để lấy dữ liệu từ stream
    const body = await req.json();

    // 2. Truy xuất thuộc tính từ object đã parse
    const { pose_summary } = body;
    console.log("Received generate-pose request", pose_summary);

    const chat = getActiveSession();

    if (!chat) {
      return NextResponse.json({ error: "No context found" }, { status: 400 });
    }

    // 1. Dùng Gemini Vision để phân tích ảnh cũ và tạo Prompt cho Mannequin
    const visionPrompt = `
      Important: Forget previous JSON format. 
      Context: You knew my image was not good at person pose reference. 
      Task: Write a highly detailed Image Generation Prompt for a 3D wooden mannequin to fix person pose better.
      Required keywords: "3D wooden mannequin, articulated joints, studio lighting, solid grey background, minimalist, high quality, photorealistic wood texture".
      Constraint: Output ONLY the English prompt string.
    `;

    console.log("visionPrompt", visionPrompt);

    const result = await chat.sendMessage([{ text: visionPrompt }]);

    const response = result.response;
    let rawText = response.text();
    console.log("rawText", rawText);
    if (!rawText) {
      const parts: any[] = response.candidates[0].content.parts;
      console.log("parts", parts);
      // Gemini 2.x đôi khi trả về part[0] là 'thought', part[1] mới là 'text'
      rawText = parts
        .map((part) => part.text || "")
        .join("")
        .replace(/./g, "")
        .trim();
    }

    const fastImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      rawText
    )}?width=512&height=512&nologo=true`;
    clearTimeout(timeoutId);
    console.log("fastImageUrl", fastImageUrl);

    return NextResponse.json({
      success: true,
      imageUrl: fastImageUrl,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
