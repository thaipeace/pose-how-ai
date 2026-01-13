"use client";

import { useState } from "react";
import { Copy, Check, Heart, Wallet, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [copied, setCopied] = useState<string | null>(null);

  // Placeholder data - User should update these
  const donationInfo = {
    usdt: {
      address: "0x6d747d3c7a87edd3e04d8f0109c698a52ae0de2c",
      network: "BEP20 (BSC)",
    },
    paypal: {
      email: "thaipeace200284@gmail.com",
      link: "https://www.paypal.com/myaccount/transfer/homepage/pay",
    },
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <footer className="w-full py-8 mt-12 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-6">

        {/* Header with Icon */}
        <div className="flex items-center space-x-2 text-rose-500">
          <Heart className="w-5 h-5 fill-current animate-pulse" />
          <span className="font-semibold text-gray-800">Hỗ trợ dự án</span>
        </div>

        <div className="w-full max-w-sm px-4 space-y-4">

          {/* USDT Section */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-teal-600">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-bold">Ủng hộ qua USDT</span>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {donationInfo.usdt.network}
              </span>
            </div>

            <button
              onClick={() => handleCopy(donationInfo.usdt.address, 'usdt')}
              className="group w-full flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer relative overflow-hidden"
            >
              <code className="text-xs text-gray-600 font-mono truncate max-w-[200px] sm:max-w-[240px]">
                {donationInfo.usdt.address}
              </code>
              <div className="flex items-center pl-2 border-l border-gray-200 text-gray-400 group-hover:text-teal-600">
                <AnimatePresence mode="wait">
                  {copied === 'usdt' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>

          {/* PayPal Section */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-blue-600">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-bold">PayPal</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {/* Copy Email Button */}
              <button
                onClick={() => handleCopy(donationInfo.paypal.email, 'paypal-email')}
                className="flex-1 flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-xs font-medium text-gray-600"
              >
                <span className="truncate mr-2">{donationInfo.paypal.email}</span>
                {copied === 'paypal-email' ? <Check className="w-3.5 h-3.5 text-blue-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {/* Open Link Button */}
              <a
                href={donationInfo.paypal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex px-4 py-2 bg-[#0070BA] text-white rounded-lg items-center justify-center font-medium text-xs hover:bg-[#005ea6] transition-colors shadow-sm"
              >
                Gửi
              </a>
            </div>
          </div>

        </div>

        <div className="text-xs text-center text-gray-400 max-w-xs mx-auto">
          <p>Yêu cầu kết nối HTTPS để hoạt động camera.</p>
        </div>
      </div>
    </footer>
  );
}
