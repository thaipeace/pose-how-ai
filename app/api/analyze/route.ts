import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { model } from "@/lib/gemini";
import { setActiveSession } from "@/lib/gemini-session";

// let activeChatSession: any = null; // Moved to lib

export async function POST(req: NextRequest) {
  // Tạo một controller để có thể hủy request nếu cần
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout

  try {
    const { image, language } = await req.json(); // Nhận chuỗi base64 và ngôn ngữ từ client

    if (!image) {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu ảnh" },
        { status: 400 }
      );
    }

    // 1. Loại bỏ prefix của base64 (nếu có) và chuyển thành Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Khởi tạo Chat Session mới
    const activeChatSession = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 5000,
        temperature: 0.2,
      },
    });
    setActiveSession(activeChatSession);

    // 2. Resize + Compress dùng Sharp
    // Gemini Vision hoạt động tốt nhất ở độ phân giải vừa phải (~768px)
    const compressedBuffer = await sharp(buffer)
      .resize(800) // Giới hạn chiều rộng tối đa 800px
      .jpeg({ quality: 80 }) // Nén chất lượng 80%
      .toBuffer();

    const finalBase64 = compressedBuffer.toString("base64");

    // 3. Xây dựng Prompt và gọi Gemini Vision
    const promptVi = `
      Chuyên gia nhiếp ảnh: Phân tích ảnh và hướng dẫn cải thiện.
      Yêu cầu: Chỉ nêu hành động cụ thể "PHẢI LÀM GÌ", cực ngắn (<10 từ/dòng).
      Trả về JSON thuần túy (3 nhóm: light, subject, tech):
      {
        "analysis": {
          "light": ["hành động 1", "hành động 2"],
          "subject": ["chỉnh tư thế/chi tiết 1", "chỉnh tư thế/chi tiết 2"],
          "tech": ["thông số ISO", "thông số Speed/EV"]
        }
      }
    `;

    const promptEn = `
      Photography Expert: Analyze the photo and provide improvement/posing tips.
      Requirement: State specific "ACTIONABLE STEPS" only, extremely short (<10 words/line).
      Return pure JSON (3 groups: light, subject, tech):
      {
        "analysis": {
          "light": ["action 1", "action 2"],
          "subject": ["pose adjustment 1", "detail adjustment 2"],
          "tech": ["ISO settings", "Speed/EV settings"]
        }
      }
    `;

    const prompt = language === 'vi' ? promptVi : promptEn;

    const result = await activeChatSession.sendMessage([
      {
        inlineData: {
          data: finalBase64,
          mimeType: "image/jpeg",
        },
      },
      { text: prompt },
    ]);

    const response = result.response;
    let rawText = response.text();

    if (!rawText) {
      const parts: any[] = response.candidates?.[0].content.parts || [];

      // Gemini 2.x đôi khi trả về part[0] là 'thought', part[1] mới là 'text'
      rawText = parts
        .map((part) => part.text || "")
        .join("")
        .trim();
    }
    clearTimeout(timeoutId);

    // 4. Parse JSON output
    const jsonStr = rawText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, advice: data });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Mạng quá chậm, vui lòng thử lại." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: "AI đang bận, thử lại sau nhé." },
      { status: 500 }
    );
  }
}


