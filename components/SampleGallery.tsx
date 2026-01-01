"use client";

import { useState } from "react";

interface SampleGalleryProps {
  onClose: () => void;
}

export default function SampleGallery({ onClose }: SampleGalleryProps) {
  // Giả lập danh sách ảnh mẫu
  const samples = [
    {
      id: 1,
      url: "https://picsum.photos/seed/p1/400/600",
      title: "Chân dung ngược sáng",
    },
    {
      id: 2,
      url: "https://picsum.photos/seed/p2/400/600",
      title: "Bố cục 1/3",
    },
    {
      id: 3,
      url: "https://picsum.photos/seed/p3/400/600",
      title: "Chụp kiến trúc",
    },
    {
      id: 4,
      url: "https://picsum.photos/seed/p4/400/600",
      title: "Chụp sản phẩm",
    },
  ];

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
        <div className="grid grid-cols-2 gap-4">
          {samples.map((img) => (
            <div key={img.id} className="group relative">
              <div className="aspect-[2/3] w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy" // Lazy load chuẩn trình duyệt
                  className="w-full h-full object-cover transition-transform group-active:scale-95"
                />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-500 text-center">
                {img.title}
              </p>
            </div>
          ))}
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
