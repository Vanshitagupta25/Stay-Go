import React from "react";

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
    <div className="flex items-center gap-6 overflow-x-auto py-4 px-2 scrollbar-none border-b border-gray-200 mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isActive ? "" : cat.id)}
            className={`flex flex-col items-center min-w-[65px] transition-all cursor-pointer border-b-2 pb-2 ${
              isActive
                ? "border-rose-500 text-rose-500 font-semibold opacity-100"
                : "border-transparent text-gray-500 hover:text-gray-900 opacity-70 hover:opacity-100"
            }`}
          >
            <span className="text-xl mb-1">{cat.icon}</span>
            <span className="text-xs whitespace-nowrap">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
