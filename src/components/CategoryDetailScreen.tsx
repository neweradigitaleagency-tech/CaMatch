import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SERVICE_CATEGORIES } from "../data/serviceCategories";
import { MOCK_PROS } from "../services/mockData";
import BentoCard from "./ui/BentoCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function CategoryDetailScreen() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const nav = useNavigate();

  const category = useMemo(
    () => SERVICE_CATEGORIES.find((c) => c.id === categoryId),
    [categoryId],
  );

  const prosForCategory = useMemo(
    () => MOCK_PROS.filter((p) => p.category === categoryId),
    [categoryId],
  );

  const subcategoryStats = useMemo(() => {
    const map = new Map<string, { count: number; avgRating: number }>();
    for (const sub of category?.subcategories ?? []) {
      const pros = prosForCategory.filter((p) => p.subCategory === sub.name);
      const avg = pros.length
        ? Math.round(pros.reduce((s, p) => s + p.rating, 0) / pros.length)
        : 0;
      map.set(sub.name, { count: pros.length, avgRating: avg });
    }
    return map;
  }, [category, prosForCategory]);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-cm-bg">
        <span className="text-[48px]">🔍</span>
        <h2 className="text-[18px] font-extrabold text-cm-text text-center">
          Catégorie introuvable
        </h2>
        <button onClick={() => nav(-1)}
          className="cm-scale-btn h-10 px-6 bg-cm-text text-white rounded-[14px] text-[12px] font-bold cursor-pointer">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-bg pb-24">
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => nav(-1)}
            className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[22px]">{category.icon}</span>
            <h1 className="text-[16px] font-extrabold bg-gradient-to-r from-cm-text to-cm-text-soft bg-clip-text text-transparent">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <BentoCard className="flex-shrink-0 flex items-center gap-2 py-3 px-4">
            <Users className="w-4 h-4 text-cm-accent" />
            <span className="text-[12px] font-bold text-cm-text">{prosForCategory.length} pros</span>
          </BentoCard>
          <BentoCard className="flex-shrink-0 flex items-center gap-2 py-3 px-4">
            <TrendingUp className="w-4 h-4 text-cm-accent" />
            <span className="text-[12px] font-bold text-cm-text">
              Note moy.{" "}
              {prosForCategory.length
                ? (Math.round(prosForCategory.reduce((s, p) => s + p.rating, 0) / prosForCategory.length) / 10).toFixed(1)
                : "—"}
              /10
            </span>
          </BentoCard>
          <BentoCard className="flex-shrink-0 flex items-center gap-2 py-3 px-4">
            <Clock className="w-4 h-4 text-cm-accent" />
            <span className="text-[12px] font-bold text-cm-text">
              {category.subcategories.length} services
            </span>
          </BentoCard>
        </div>
      </div>

      <div className="px-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {category.subcategories.map((sub, i) => {
            const stats = subcategoryStats.get(sub.name);
            return (
              <motion.div key={sub.name} variants={itemAnim}>
                <button
                  onClick={() => nav(`/search?subCategory=${encodeURIComponent(sub.name)}&category=${category.id}`)}
                  className="cm-scale-btn w-full text-left cursor-pointer"
                >
                  <BentoCard
                    className="h-full flex flex-col gap-2 group hover:border-cm-accent/30 transition-colors"
                    span={1}
                  >
                    <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-cm-accent/20 to-cm-accent-soft/30 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">
                      {getSubIcon(i)}
                    </div>
                    <span className="text-[13px] font-bold text-cm-text leading-tight">
                      {sub.name}
                    </span>
                    {stats && (
                      <span className="text-[10px] text-cm-text-muted font-medium">
                        {stats.count} pro{stats.count !== 1 ? "s" : ""} · {stats.avgRating > 0 ? (stats.avgRating / 10).toFixed(1) : "—"}/10
                      </span>
                    )}
                  </BentoCard>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

const SUB_ICONS = [
  "🔧", "⚡", "🧱", "🎨", "⬜", "🪚", "🔥", "🪟", "🔐", "❄️", "🧹", "🌿",
  "🚗", "📦", "📦", "🚚", "🛞",
  "🎵", "🎤", "📷", "🎬", "🎀", "🔊", "💡", "🍽️", "👔", "🪑",
  "📝", "💻", "🔒", "💻", "🤖", "🌐", "📋",
  "🌐", "📱", "🎨", "🎨", "📱", "🎬", "📊", "🔍", "📘", "📘",
  "🧹", "👶", "🏥", "📋", "🛒", "📄",
];

function getSubIcon(index: number): string {
  return SUB_ICONS[index % SUB_ICONS.length];
}
