import React from 'react';
import { Plus, X, Search, MessageSquare } from 'lucide-react';
import { SearchSession } from '../types';

interface SearchTabsProps {
  sessions: SearchSession[];
  activeId: string;
  onSwitch: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
  onNew: () => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ sessions, activeId, onSwitch, onClose, onNew }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 w-full border-b border-slate-800/50 mb-6">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSwitch(session.id)}
          className={`
            group relative flex items-center gap-2 min-w-[160px] max-w-[240px] px-4 py-2.5 rounded-t-lg cursor-pointer border-b-2 transition-all duration-200
            ${activeId === session.id 
              ? 'bg-slate-800/60 border-blue-500 text-blue-100' 
              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }
          `}
        >
          <div className={`shrink-0 ${activeId === session.id ? 'text-blue-400' : 'text-slate-600'}`}>
            {session.status === 'SUCCESS' ? <MessageSquare size={14} /> : <Search size={14} />}
          </div>
          
          <span className="text-sm font-medium truncate select-none flex-1">
            {session.query.trim() || "New Search"}
          </span>

          {sessions.length > 1 && (
            <button
              onClick={(e) => onClose(session.id, e)}
              className={`
                p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                ${activeId === session.id ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-700/50 text-slate-600'}
              `}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onNew}
        className="p-2 ml-1 text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-colors"
        title="New Tab"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default SearchTabs;