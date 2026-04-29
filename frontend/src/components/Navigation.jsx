import { motion } from 'framer-motion';
import { Grid, Clock, Sparkles } from 'lucide-react';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'movies', label: 'Movies', icon: Grid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  ];

  return (
    <div className="flex gap-2 mb-8 p-1 glass rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}