import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { cardAppear } from "../animations/variants";

export type SponsoredItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  tagline: string;
  link: string;
  size: "small" | "medium" | "large";
};

interface SponsoredCardProps {
  item: SponsoredItem;
  index: number;
}

const sizeClasses: Record<SponsoredItem["size"], string> = {
  small: "col-span-1 aspect-[4/3]",
  medium: "col-span-2 aspect-[16/9]",
  large: "col-span-2 aspect-[2/1]",
};

export default function SponsoredCard({ item, index }: SponsoredCardProps) {
  const nav = useNavigate();

  return (
    <motion.div
      layout
      variants={cardAppear}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => nav(item.link)}
      className={`${sizeClasses[item.size]} relative rounded-[12px] overflow-hidden cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.08)] group`}
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/90 via-[#2B2B2B]/20 to-transparent" />
      <div className="absolute top-2.5 left-2.5">
        <span className="inline-block px-2 py-0.5 rounded-full bg-[#7FD356] text-[#2B2B2B] text-[10px] font-bold leading-tight">
          {item.category}
        </span>
      </div>
      <div className="absolute bottom-2.5 left-3 right-3">
        <h3 className="text-[14px] font-bold text-white leading-tight">{item.name}</h3>
        <p className="text-[11px] text-white/70 mt-0.5 leading-tight">{item.tagline}</p>
      </div>
    </motion.div>
  );
}
