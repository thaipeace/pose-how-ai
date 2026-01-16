"use client";

import clsx from "clsx";
import { useState, useRef } from "react";
import SampleGallery from "./SampleGallery";
import { useLanguage } from "@/lib/LanguageContext";
import { usePoseStore } from "@/lib/store";

export default function CameraModule() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const setGeneratedImage = usePoseStore((state) => state.setGeneratedImage);

  const [analysisResult, setAnalysisResult] = useState<
    { light: string[]; subject: string[]; tech: string[] } | string | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const { t, language } = useLanguage();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith("image/")) {
      alert(t('alertImageFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;

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
        body: JSON.stringify({ image: capturedImage, language }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.advice.analysis);

        // --- Trigger Pose Generation with Zustand ---
        // Image URL is now returned directly from the analyze API
        if (data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          console.warn("No image URL returned from analysis");
          setGeneratedImage(null);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setAnalysisResult(t('serverError'));
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4">
      <div className="relative aspect-[3/4] w-full bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {!capturedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4 cursor-pointer hover:bg-gray-900 transition-colors"
          >
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
              📸
            </div>
            <p className="font-bold text-sm tracking-wide">{t('takePhoto')}</p>
          </div>
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
            <p className="text-lg font-bold">{t('analyzing')}</p>
            <p className="text-xs text-gray-400 mt-2">
              {t('geminiThinking')}
            </p>
          </div>
        )}

        {/* FALLBACK KHI LỖI */}
        {analysisResult == t('serverError') && (
          <div className="absolute inset-0 bg-rose-900/90 flex flex-col items-center justify-center text-white p-6 text-center">
            <span className="text-4xl mb-2">⚠️</span>
            <p className="font-bold">{t('connectionFailed')}</p>
            <p className="text-sm opacity-80 mb-4">
              {t('connectionError')}
            </p>
            <button
              onClick={handleAnalyze}
              className="px-6 py-2 bg-white text-rose-900 rounded-full font-bold active:scale-95"
            >
              {t('tryAgain')}
            </button>
          </div>
        )}
      </div>


      {analysisResult && typeof analysisResult !== "string" && (
        <div className="mt-4 space-y-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
            {t('photoTips')}
          </h3>

          {/* Nhóm Ánh sáng */}
          <div>
            <h4 className="font-bold text-amber-600 text-sm uppercase">
              {t('lighting')}
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
              {t('subject')}
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
              {t('techSpecs')}
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

        {capturedImage ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl"
            >
              {t('retake')}
            </button>
            {analysisResult && (
              <button
                onClick={() => setShowSamples(true)}
                className="text-xs font-bold py-2 px-4 bg-white border border-gray-200 shadow-sm rounded-full text-indigo-600 active:scale-95 transition-all"
              >
                {t('viewSamples')}
              </button>
            )}
            {!analysisResult && (
              <button
                onClick={handleAnalyze}
                className="py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200"
              >
                {t('analyze')}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {t('takePhoto')}
          </button>
        )}
      </div>


      {/* HIỂN THỊ MODAL KHI CẦN */}
      {showSamples && (
        <SampleGallery
          onClose={() => setShowSamples(false)}
        />
      )}
    </div>
  );
}

