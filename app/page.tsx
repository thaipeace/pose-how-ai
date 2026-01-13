"use client";

import CameraModule from "@/components/CameraModule";
import HamburgerMenu from "@/components/HamburgerMenu";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-10">
        <header className="mb-8 flex flex-col items-center relative">
          <div className="absolute right-0 top-0">
            <HamburgerMenu />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('pageTitle')}</h1>
          <p className="text-gray-500">{t('pageSubtitle')}</p>
        </header>

        {/* Gọi Client Component ở đây */}
        <CameraModule />

        <Footer />
      </div>
    </main>
  );
}
