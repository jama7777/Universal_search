import React from 'react';
import { SearchSource } from '../types';
import { ExternalLink, FileText, Code, Globe, Layers } from 'lucide-react';

interface SourceListProps {
  sources: SearchSource[];
}

export const getCategory = (uri: string): 'PAPER' | 'APP' | 'GENERAL' => {
  const lower = uri.toLowerCase();
  
  const paperDomains = [
    'arxiv.org', 'biorxiv.org', 'medrxiv.org', 'ieee.org', 'acm.org', 
    'nature.com', 'science.org', 'springer.com', 'sciencedirect.com', 
    'ncbi.nlm.nih.gov', 'semanticscholar.org', 'researchgate.net'
  ];
  
  const appDomains = [
    'github.com', 'gitlab.com', 'huggingface.co', 'producthunt.com', 
    'pypi.org', 'npmjs.com', 'sourceforge.net', 'stackoverflow.com',
    'dev.to', 'vercel.com', 'netlify.com'
  ];

  if (paperDomains.some(d => lower.includes(d))) return 'PAPER';
  if (appDomains.some(d => lower.includes(d))) return 'APP';
  return 'GENERAL';
};

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  // If undefined or empty, return null
  if (!sources || sources.length === 0) return null;

  const grouped = sources.reduce((acc, source) => {
    const cat = getCategory(source.uri);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(source);
    return acc;
  }, {} as Record<string, SearchSource[]>);

  const renderGroup = (title: string, icon: React.ReactNode, items: SearchSource[] | undefined) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-slate-300 font-medium text-xs uppercase tracking-wider">
          {icon}
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {items.map((source, index) => (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-2.5 bg-slate-900/50 hover:bg-slate-800 transition-all rounded-lg border border-slate-800 hover:border-blue-500/30"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-300 group-hover:text-blue-300 line-clamp-2 leading-snug">
                  {source.title}
                </span>
                <ExternalLink size={12} className="text-slate-600 group-hover:text-blue-400 mt-0.5 shrink-0 ml-2" />
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500 font-mono truncate">
                {new URL(source.uri).hostname}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 h-fit sticky top-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 text-slate-200 font-semibold border-b border-slate-700/50 pb-3">
        <Globe size={16} className="text-blue-400" />
        <h3>References</h3>
      </div>
      
      {renderGroup('Research Papers', <FileText size={14} className="text-emerald-400" />, grouped['PAPER'])}
      {renderGroup('Applications & Code', <Code size={14} className="text-purple-400" />, grouped['APP'])}
      {renderGroup('General Sources', <Layers size={14} className="text-amber-400" />, grouped['GENERAL'])}
      
      <div className="mt-2 pt-2 text-center">
         <p className="text-[10px] text-slate-600">Powered by Google Search</p>
      </div>
    </div>
  );
};

export default SourceList;