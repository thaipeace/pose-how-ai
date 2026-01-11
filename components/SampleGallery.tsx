"use client";

import { useEffect, useState } from "react";

interface SampleGalleryProps {
  analysisResult: any;
  onClose: () => void;
}

export default function SampleGallery({
  onClose,
  analysisResult,
}: SampleGalleryProps) {
  const [img, setImg] = useState();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePose = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-pose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pose_summary: analysisResult.subject.join(""),
        }),
      });

      const data = await res.json();
      console.log("Pose generation response:", data);
      setImg(data.imageUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGeneratePose();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Lớp nền đóng khi click ra ngoài */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] shadow-2xl p-6 h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
        {/* Handle bar cho cảm giác vuốt */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Hình mẫu tham khảo
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Grid hiển thị ảnh mẫu */}
        <div className="aspect-[2/3] w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={img || "/loading-spinner.gif"}
            alt={img ? "Generated Pose" : "Loading"}
            loading="lazy" // Lazy load chuẩn trình duyệt
            className="w-full h-full object-cover transition-transform group-active:scale-95"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl"
        >
          Quay lại chụp ảnh
        </button>
      </div>
    </div>
  );
}
