"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: "google" | "facebook" | "twitter") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed z-50 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            // Start centered
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Header */}
            <div className="relative p-6 text-center border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sign in to continue to Pose How AI
              </p>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-4">
              <SocialButton
                provider="google"
                label="Continue with Google"
                onClick={() => handleLogin("google")}
                disabled={loading}
              />
              {/* <SocialButton
                provider="facebook"
                label="Continue with Facebook"
                onClick={() => handleLogin("facebook")}
                disabled={loading}
              />
              <SocialButton
                provider="twitter"
                label="Continue with X"
                onClick={() => handleLogin("twitter")}
                disabled={loading}
              /> */}
            </div>

            <div className="p-6 bg-gray-50 text-center text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SocialButton({
  provider,
  label,
  onClick,
  disabled,
}: {
  provider: "google" | "facebook" | "twitter";
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const getIcon = () => {
    switch (provider) {
      case "google":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        );
      case "facebook":
        return (
          <svg
            className="w-5 h-5 text-[#1877F2]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-6.304 6.162-6.304 1.125 0 2.733.085 2.733.085v3.475h-1.636c-1.961 0-2.502 1.353-2.502 2.504l-.004 1.838h3.968l-.48 3.667h-3.488v7.98H9.101z" />
          </svg>
        );
      case "twitter":
        return (
          <svg
            className="w-5 h-5 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-sm"
    >
      {getIcon()}
      <span>{label}</span>
    </button>
  );
}
