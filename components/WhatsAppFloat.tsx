"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

export default function WhatsAppFloat() {
  return (
    <motion.a
      href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-5 sm:right-7 z-50"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#1DA851] shadow-lg shadow-[#25D366]/35 text-white">
        <MessageCircle size={28} />
      </span>
    </motion.a>
  );
}
