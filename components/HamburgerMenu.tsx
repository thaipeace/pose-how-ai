"use client";

import { useEffect, useState } from "react";
import { Menu, X, User, LogOut, LogIn, Globe, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import SignInModal from "./SignInModal";
import { useLanguage } from "@/lib/LanguageContext";

import { saveUserProfile } from "@/lib/user";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' && currentUser) {
        saveUserProfile(currentUser);
      }
    });

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors z-40 relative"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="font-bold text-lg text-gray-800">{t('menuTitle')}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Language Switch */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium text-sm">Language / Ngôn ngữ</span>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${language === "en"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    ENG
                  </button>
                  <button
                    onClick={() => setLanguage("vi")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${language === "vi"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    VIE
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 py-6">
                <div className="space-y-6">
                  {/* Common Actions */}
                  {deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      {t('installApp')}
                    </button>
                  )}

                  {user ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                          {user.email ? user.email[0].toUpperCase() : <User />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-gray-900 truncate">
                            {user.user_metadata?.full_name || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        {t('signOut')}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-gray-50 rounded-2xl text-center mb-6">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm mx-auto flex items-center justify-center mb-4">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">{t('signInPrompt')}</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setIsSignInModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                      >
                        <span className="font-semibold">{t('signIn')}</span>
                        <LogIn className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 text-center text-xs text-gray-400">
                {t('version')}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
