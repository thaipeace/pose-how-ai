"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "vi";

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    en: {
        // Hamburger Menu
        menuTitle: "Menu",
        installApp: "Install App",
        signOut: "Sign Out",
        signInPrompt: "Sign in to save your history and preferences.",
        signIn: "Sign In",
        version: "v1.0.0 • Pose How AI",

        // Sign In Modal
        welcomeBack: "Welcome Back",
        signInContinue: "Sign in to continue to Pose How AI",
        continueGoogle: "Continue with Google",
        startCamera: "Start Camera", // Just in case
        terms: "By signing in, you agree to our Terms of Service and Privacy Policy.",

        // Camera Module
        alertImageFile: "Please select an image file.",
        analyzing: "Analyzing image...",
        geminiThinking: "Gemini is reviewing your lighting and composition",
        connectionFailed: "Connection failed",
        connectionError: "Weak signal or Server overloaded.",
        tryAgain: "Try Again",
        autoRotate: "Supports Auto-Rotate Canvas",
        takePhoto: "📸 Take Photo",
        gallery: "🖼️ Gallery",
        retake: "🔄 Retake",
        viewSamples: "🖼️ Generate Pose",
        analyze: "✨ Analyze",
        openCamera: "Open Camera",
        photoTips: "💡 Photography Tips",
        lighting: "☀️ Lighting",
        subject: "🧍 Subject",
        techSpecs: "⚙️ Technical Specs",
        serverError: "Cannot connect to server.",

        // Sample Gallery
        sampleGalleryTitle: "Reference Poses",
        aiGenerating: "AI is generating pose...",
        aiGeneratingTime: "Usually takes 7-10 seconds",
        backToCamera: "Back to Camera",

        // Results/Analysis Keys (Dynamic content might need separate handling, but headers are static)

        // Page
        pageTitle: "How WOW! Pose",
        pageSubtitle: "Suggestion on you",

        // Footer
        supportProject: "Support the Project",
        donateUSDT: "Donate via USDT",
        send: "Send",
        httpsRequired: "HTTPS connection required for camera operation.",
        paypal: "PayPal"
    },
    vi: {
        // Hamburger Menu
        menuTitle: "Menu",
        installApp: "Cài đặt ứng dụng",
        signOut: "Đăng xuất",
        signInPrompt: "Đăng nhập để lưu lịch sử và tùy chọn của bạn.",
        signIn: "Đăng nhập",
        version: "v1.0.0 • Pose How AI",

        // Sign In Modal
        welcomeBack: "Chào mừng trở lại",
        signInContinue: "Đăng nhập để tiếp tục với Pose How AI",
        continueGoogle: "Tiếp tục với Google",
        startCamera: "Bắt đầu Camera",
        terms: "Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư của chúng tôi.",

        // Camera Module
        alertImageFile: "Vui lòng chọn tệp hình ảnh.",
        analyzing: "Đang phân tích ảnh...",
        geminiThinking: "Gemini đang xem xét ánh sáng và bố cục của bạn",
        connectionFailed: "Kết nối thất bại",
        connectionError: "Sóng yếu hoặc Server quá tải.",
        tryAgain: "Thử lại",
        autoRotate: "Hỗ trợ Auto-Rotate Canvas",
        takePhoto: "📸 Chụp Ảnh",
        gallery: "🖼️ Thư viện",
        retake: "🔄 Làm lại",
        viewSamples: "🖼️ Tạo mẫu",
        analyze: "✨ Phân tích",
        openCamera: "Mở Camera",
        photoTips: "💡 Hướng dẫn chụp đẹp",
        lighting: "☀️ Ánh sáng",
        subject: "🧍 Chủ thể",
        techSpecs: "⚙️ Thông số kỹ thuật",
        serverError: "Không thể kết nối đến server.",

        // Sample Gallery
        sampleGalleryTitle: "Hình mẫu tham khảo",
        aiGenerating: "AI đang vẽ dáng người...",
        aiGeneratingTime: "Thường mất khoảng 7-10 giây",
        backToCamera: "Quay lại chụp ảnh",

        // Page
        pageTitle: "Chụp Sao Cho Đẹp nè!",
        pageSubtitle: "Giúp nhanh case khó.",

        // Footer
        supportProject: "Hỗ trợ dự án",
        donateUSDT: "Ủng hộ qua USDT",
        send: "Gửi",
        httpsRequired: "Yêu cầu kết nối HTTPS để hoạt động camera.",
        paypal: "PayPal"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("vi");

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
