import { BeverageType } from '@/types/winery';

const categoryInfo: Record<BeverageType, { label: string; color: string; emoji: string }> = {
  winery: { label: 'Winery', color: 'bg-purple-100 text-purple-800 border-purple-300', emoji: '🍷' },
  cidery: { label: 'Cidery', color: 'bg-amber-100 text-amber-800 border-amber-300', emoji: '🍎' },
  brewery: { label: 'Brewery', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', emoji: '🍺' },
  distillery: { label: 'Distillery', color: 'bg-blue-100 text-blue-800 border-blue-300', emoji: '🥃' },
};

export default function CategoryBadges({ categories }: { categories?: BeverageType[] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const info = categoryInfo[category];
        return (
          <span
            key={category}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${info.color}`}
          >
            <span>{info.emoji}</span>
            <span>{info.label}</span>
          </span>
        );
      })}
    </div>
  );
}
