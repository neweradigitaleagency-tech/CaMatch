"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Bell, Shield, Globe, LogOut, Trash2, Smartphone, User, Camera, ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Compte",
    items: [
      { icon: User, label: "Informations personnelles", href: "#", danger: false },
      { icon: Shield, label: "Vérification d'identité", href: "#", danger: false },
      { icon: Smartphone, label: "Numéro de téléphone", value: "+225 01 02 03 04 05", href: "#", danger: false },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: Bell, label: "Notifications", href: "#", danger: false },
      { icon: Globe, label: "Langue", value: "Français", href: "#", danger: false },
    ],
  },
  {
    title: "Confidentialité",
    items: [
      { icon: Shield, label: "Mes données", href: "#", danger: false },
      { icon: Trash2, label: "Supprimer mon compte", href: "#", danger: true },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "pro">("client");

  return (
    <main className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Profil</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-6"
        >
          <div className="relative mb-4">
            <Avatar size="xl" alt="Vous" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-soft">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary">Vous</h2>
          <p className="text-sm text-text-secondary">+225 01 02 03 04 05</p>
          <div className="mt-3 flex items-center gap-2">
            <BadgeLevel level="GOLD" />
            <span className="text-xs text-text-secondary">Membre depuis 2026</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gray-50 rounded-2xl p-1.5 flex"
        >
          <button
            onClick={() => setRole("client")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              role === "client" ? "bg-white text-text-primary shadow-soft" : "text-text-secondary"
            )}
          >
            👤 Client
          </button>
          <button
            onClick={() => setRole("pro")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              role === "pro" ? "bg-white text-text-primary shadow-soft" : "text-text-secondary"
            )}
          >
            🛠️ Professionnel
          </button>
        </motion.div>

        {role === "pro" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 border border-primary-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Mode Pro activé</p>
                <p className="text-xs text-text-secondary">Gérez vos missions et votre portfolio</p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm bg-primary text-white px-4 py-2 rounded-xl font-medium"
              >
                Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + si * 0.05 }}
          >
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-soft">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
                >
                  <item.icon className={cn("w-5 h-5", item.danger ? "text-danger" : "text-text-tertiary")} />
                  <span className={cn("flex-1 text-sm", item.danger ? "text-danger font-medium" : "text-text-primary")}>
                    {item.label}
                  </span>
                  {item.value && <span className="text-xs text-text-tertiary">{item.value}</span>}
                  <ChevronRight className="w-4 h-4 text-text-tertiary" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-soft active:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-danger" />
            <span className="text-sm text-danger font-medium">Se d&eacute;connecter</span>
          </button>
        </motion.div>

        <p className="text-center text-2xs text-text-tertiary pb-4">
           &Ccedil;a Match v1.0 MVP &middot; C&ocirc;te d&apos;Ivoire
        </p>
      </div>
    </main>
  );
}
