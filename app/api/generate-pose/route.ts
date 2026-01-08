import { NextRequest, NextResponse } from "next/server";
import { getActiveSession } from "../analyze/route";

export async function POST(req: NextRequest) {
  // Tạo một controller để có thể hủy request nếu cần
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 15 giây timeout

  try {
    const { pose_summary } = await req.json();
    const chat = getActiveSession();

    if (!chat) {
      return NextResponse.json({ error: "No context found" }, { status: 400 });
    }

    // 1. Dùng Gemini Vision để phân tích ảnh cũ và tạo Prompt cho Mannequin
    const visionPrompt = `
      Context: Bạn đã thấy ảnh nháp tôi gửi trước đó.
      Yêu cầu: Sửa tư thế hoăc gợi ý tư thế hợp với ảnh đó theo ý muốn: "${pose_summary}".
      Nhiệm vụ: Viết 1 đoạn Image Generation Prompt (tiếng Anh) để tạo ra 1 ảnh 3D mannequin gỗ, tư thế đã sửa, nền xám trơn, không vật dụng thừa.
      Quy tắc: ChỈ trả về đoạn Prompt tiếng Anh, không thêm bất kỳ từ giải thích nào khác.
    `;

    const result = await chat.sendMessage(visionPrompt);

    const enhancedPrompt = result.response.text().trim();

    const fastImageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=512&height=512&nologo=true`;
    clearTimeout(timeoutId);

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
