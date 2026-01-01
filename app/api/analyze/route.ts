import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  // Tạo một controller để có thể hủy request nếu cần
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout

  try {
    const { image } = await req.json(); // Nhận chuỗi base64 từ client

    if (!image) {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu ảnh" },
        { status: 400 }
      );
    }

    // 1. Loại bỏ prefix của base64 (nếu có) và chuyển thành Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 2. Resize + Compress dùng Sharp
    // Gemini Vision hoạt động tốt nhất ở độ phân giải vừa phải (~768px)
    const compressedBuffer = await sharp(buffer)
      .resize(800) // Giới hạn chiều rộng tối đa 800px
      .jpeg({ quality: 80 }) // Nén chất lượng 80%
      .toBuffer();

    const finalBase64 = compressedBuffer.toString("base64");

    // 3. Xây dựng Prompt và gọi Gemini Vision
    const prompt = `
      Bạn là một chuyên gia nhiếp ảnh chuyên nghiệp. 
      Hãy phân tích ảnh này và đưa ra hướng dẫn cụ thể để cải thiện bức ảnh tiếp theo.

      Yêu cầu bắt buộc:
      1. Nội dung tập trung vào hành động "PHẢI LÀM GÌ".
      2. Chia thành 3 nhóm: Ánh sáng; Chủ thể (chủ yếu điều chỉnh tư thế, tay, chân, mặt, thân mình ...) để ảnh đẹp nhất hợp với phông nền nhất; Thông số kỹ thuật (ISO, Speed, EV) cụ thể bằng số.
      3. Mỗi nhóm có ít nhất 2 gạch đầu dòng cực ngắn gọn (dưới 10 từ mỗi dòng).
      4. Phản hồi dưới dạng JSON thuần túy theo cấu trúc sau:
      {
        "analysis": {
          "light": ["Gạch đầu dòng 1", "Gạch đầu dòng 2"],
          "subject": ["Gạch đầu dòng 1", "Gạch đầu dòng 2"],
          "tech": ["Gạch đầu dòng 1", "Gạch đầu dòng 2"]
        }
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: finalBase64,
          mimeType: "image/jpeg",
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    clearTimeout(timeoutId); // Xóa timeout nếu thành công
    const text = response.text();

    // 4. Parse JSON output
    // Đôi khi Gemini trả về text kèm markdown ```json ... ``` nên cần dọn dẹp
    const jsonStr = text.replace(/```json|```/g, "").trim();
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
