import React from 'react';
import { SearchCategory, NavItem } from '../types';
import { LayoutGrid, HeartPulse, Smile, Briefcase, GraduationCap, Palette } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: SearchCategory;
  onSelectCategory: (category: SearchCategory) => void;
}

const CATEGORIES: NavItem[] = [
  { id: 'General', label: 'All Categories', icon: <LayoutGrid size={18} /> },
  { id: 'Health', label: 'Health & Bio', icon: <HeartPulse size={18} /> },
  { id: 'Emotion', label: 'Emotion & Psych', icon: <Smile size={18} /> },
  { id: 'Business', label: 'Enterprise', icon: <Briefcase size={18} /> },
  { id: 'Education', label: 'Education', icon: <GraduationCap size={18} /> },
  { id: 'Creative', label: 'Creative Arts', icon: <Palette size={18} /> },
];

const CategorySidebar: React.FC<CategorySidebarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-800 bg-[#0f172a]/80 backdrop-blur-md pt-8 px-4 z-20">
      <div className="mb-8 px-2">
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Research Domains</h2>
      </div>
      
      <nav className="space-y-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto mb-8 px-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/10">
          <p className="text-xs text-indigo-300 leading-relaxed">
            Select a domain to filter search results for specific applications and papers.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;