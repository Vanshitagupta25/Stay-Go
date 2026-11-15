import React from "react";
import { motion } from "framer-motion";

export interface Category {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "trending", label: "Trending", icon: "🔥" },
  { id: "rooms", label: "Rooms", icon: "🛏️" },
  { id: "farms", label: "Farms", icon: "🚜" },
  { id: "iconicCities", label: "Iconic cities", icon: "🏙️" },
  { id: "beach", label: "Beach", icon: "🏖️" },
  { id: "pools", label: "Pools", icon: "🏊" },
  { id: "mountains", label: "Mountains", icon: "⛰️" },
  { id: "camping", label: "Camping", icon: "⛺" },
  { id: "domes", label: "Domes", icon: "🛖" },
  { id: "bedAndBreakfast", label: "Bed & Breakfast", icon: "☕" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="scrollbar-none mb-6 flex items-center gap-1.5 overflow-x-auto border-b border-gray-200/80 px-1 pb-3 pt-1">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isActive ? "" : cat.id)}
            aria-pressed={isActive}
            className={`group relative flex min-w-[74px] cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-colors duration-200 ${
              isActive
                ? "text-[#fe424d]"
                : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-active-pill"
                className="absolute inset-0 rounded-2xl bg-rose-50 ring-1 ring-rose-100"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 text-xl transition-transform duration-200 group-hover:-translate-y-0.5">
              {cat.icon}
            </span>
            <span
              className={`relative z-10 whitespace-nowrap text-xs ${
                isActive ? "font-semibold" : "font-medium"
              }`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
