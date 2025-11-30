import React from 'react';
import { SearchSource } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface SourceListProps {
  sources: SearchSource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 h-fit sticky top-6">
      <div className="flex items-center gap-2 mb-4 text-slate-200 font-semibold">
        <Globe size={18} className="text-blue-400" />
        <h3>Sources & References</h3>
      </div>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-3 bg-slate-900/50 hover:bg-slate-700 transition-all rounded-lg border border-slate-800 hover:border-blue-500/30"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-300 group-hover:text-blue-300 line-clamp-2 leading-snug">
                {source.title}
              </span>
              <ExternalLink size={14} className="text-slate-500 group-hover:text-blue-400 mt-1 shrink-0 ml-2" />
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono truncate">
              {new URL(source.uri).hostname}
            </div>
          </a>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
         <p className="text-xs text-slate-500">Powered by Google Search Grounding</p>
      </div>
    </div>
  );
};

export default SourceList;