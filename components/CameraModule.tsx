"use client";

import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import SampleGallery from "./SampleGallery";

export default function CameraModule() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // State lưu góc xoay vật lý (0, 90, -90)
  const [physicalAngle, setPhysicalAngle] = useState(0);

  const [analysisResult, setAnalysisResult] = useState<
    { light: string[]; subject: string[]; tech: string[] } | string | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      // Dừng camera nếu đang bật trước khi hiện ảnh từ gallery
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        setIsStreaming(false);
      }

      setCapturedImage(base64); // Hiển thị ảnh vừa chọn lên khung preview
      setAnalysisResult(null); // Xóa kết quả phân tích cũ
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.advice.analysis);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setAnalysisResult("Không thể kết nối đến server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    setAnalysisResult(null);
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

        {/* OVERLAY LOADING: Cực kỳ quan trọng để ko cảm thấy đơ */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-bold">Đang phân tích ảnh...</p>
            <p className="text-xs text-gray-400 mt-2">
              Gemini đang xem xét ánh sáng và bố cục của bạn
            </p>
          </div>
        )}

        {/* FALLBACK KHI LỖI */}
        {analysisResult == "Không thể kết nối đến server." && (
          <div className="absolute inset-0 bg-rose-900/90 flex flex-col items-center justify-center text-white p-6 text-center">
            <span className="text-4xl mb-2">⚠️</span>
            <p className="font-bold">Kết nối thất bại</p>
            <p className="text-sm opacity-80 mb-4">
              Sóng yếu hoặc Server quá tải.
            </p>
            <button
              onClick={handleAnalyze}
              className="px-6 py-2 bg-white text-rose-900 rounded-full font-bold active:scale-95"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {analysisResult && typeof analysisResult !== "string" && (
        <div className="mt-4 space-y-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
            💡 Hướng dẫn chụp đẹp
          </h3>

          {/* Nhóm Ánh sáng */}
          <div>
            <h4 className="font-bold text-amber-600 text-sm uppercase">
              ☀️ Ánh sáng
            </h4>
            <ul className="list-disc list-inside text-gray-600 text-sm ml-2">
              {analysisResult.light.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Nhóm Chủ thể */}
          <div>
            <h4 className="font-bold text-blue-600 text-sm uppercase">
              🧍 Chủ thể
            </h4>
            <ul className="list-disc list-inside text-gray-600 text-sm ml-2">
              {analysisResult.subject.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Nhóm Thông số kỹ thuật */}
          <div>
            <h4 className="font-bold text-emerald-600 text-sm uppercase">
              ⚙️ Thông số kỹ thuật
            </h4>
            <ul className="list-disc list-inside text-gray-600 text-sm ml-2 bg-gray-50 p-2 rounded-lg">
              {analysisResult.tech.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div
        className={clsx("space-y-3", {
          "pointer-events-none opacity-50 bg-gray-200": isAnalyzing,
        })}
      >
        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        {isStreaming ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={takePhoto}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              📸 Chụp Ảnh
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              🖼️ Thư viện
            </button>
          </div>
        ) : capturedImage ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl"
            >
              🔄 Làm lại
            </button>
            <button
              onClick={() => setShowSamples(true)}
              className="text-xs font-bold py-2 px-4 bg-white border border-gray-200 shadow-sm rounded-full text-indigo-600 active:scale-95 transition-all"
            >
              🖼️ Xem hình mẫu
            </button>
            {!analysisResult && (
              <button
                onClick={handleAnalyze}
                className="py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200"
              >
                ✨ Phân tích
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl"
            >
              Mở Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              🖼️ Thư viện
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
        Hỗ trợ Auto-Rotate Canvas
      </p>

      {/* HIỂN THỊ MODAL KHI CẦN */}
      {showSamples && <SampleGallery onClose={() => setShowSamples(false)} />}
    </div>
  );
}
