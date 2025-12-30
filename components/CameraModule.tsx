"use client";

import { useState, useRef, useEffect } from "react";

export default function CameraModule() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // State lưu góc xoay vật lý (0, 90, -90)
  const [physicalAngle, setPhysicalAngle] = useState(0);

  // Lắng nghe cảm biến chuyển động
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;

      // Logic xác định hướng máy dựa trên trọng lực
      // beta: nghiêng tới/lui (-180 đến 180)
      // gamma: nghiêng trái/phải (-90 đến 90)

      if (beta !== null && gamma !== null) {
        if (Math.abs(gamma) > 45) {
          // Nếu máy nghiêng sang bên hơn 45 độ => Landscape
          setPhysicalAngle(gamma > 0 ? 90 : -90);
        } else {
          // Nếu máy đứng => Portrait
          setPhysicalAngle(0);
        }
      }
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }, []);

  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsStreaming(true);
      }
    } catch (err) {
      alert("Lỗi camera!");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Lấy thông tin xoay của thiết bị (0, 90, -90, 180)
    // Ngay cả khi UI bị khóa dọc, giá trị này vẫn thay đổi khi quay máy
    const angle = physicalAngle;

    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;

    // 2. Quyết định kích thước Canvas dựa trên góc xoay
    // Nếu máy nằm ngang (90 hoặc -90), ta hoán đổi Rộng/Cao để ảnh ra đúng chiều ngang
    if (Math.abs(angle) === 90) {
      canvas.width = vHeight;
      canvas.height = vWidth;
    } else {
      canvas.width = vWidth;
      canvas.height = vHeight;
    }

    // 3. Xử lý xoay context của Canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);

    // Vẽ video vào tâm canvas đã xoay
    // Lưu ý: khi đã rotate context, ta vẽ dựa trên kích thước gốc của video
    ctx.drawImage(video, -vWidth / 2, -vHeight / 2, vWidth, vHeight);
    ctx.restore();

    // 4. Xuất ảnh
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));

    // Dừng camera
    (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4">
      <div className="relative aspect-[3/4] w-full bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-3">
        {isStreaming ? (
          <button
            onClick={takePhoto}
            className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            📸 Chụp Ảnh
          </button>
        ) : capturedImage ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl"
            >
              🔄 Chụp lại
            </button>
            <button
              onClick={() => alert("Sẵn sàng phân tích!")}
              className="py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200"
            >
              ✨ Phân tích
            </button>
          </div>
        ) : (
          <button
            onClick={startCamera}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl"
          >
            Mở Camera
          </button>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
        Hỗ trợ Auto-Rotate Canvas
      </p>
    </div>
  );
}
