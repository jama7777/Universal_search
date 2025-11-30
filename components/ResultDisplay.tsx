import React, { useState, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { SearchResult } from '../types';
import { Layers, BookOpen, Zap, Info } from 'lucide-react';

interface ResultDisplayProps {
  result: SearchResult;
}

type SectionTab = 'OVERVIEW' | 'APPLICATIONS' | 'RESEARCH' | 'ECOSYSTEM';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('OVERVIEW');

  // Split content based on Headers defined in the Prompt
  const sections = useMemo(() => {
    const text = result.markdownText;
    
    // Simple parsing strategy based on known headers
    const parts = text.split(/## \d+\. /);
    
    // parts[0] is usually Intro/Overview
    // parts[1] is Applications
    // parts[2] is Research
    // parts[3] is Ecosystem
    
    return {
      overview: parts[0] || "",
      applications: parts[1] || "",
      research: parts[2] || "",
      ecosystem: parts[3] || ""
    };
  }, [result.markdownText]);

  // If parsing failed (length check), fall back to simple renderer
  const isParsedCorrectly = sections.applications && sections.research;

  if (!isParsedCorrectly) {
    return <MarkdownRenderer content={result.markdownText} />;
  }

  const renderTabButton = (id: SectionTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all flex-1 md:flex-none justify-center
        ${activeTab === id 
          ? 'border-blue-500 text-blue-100 bg-slate-800/30' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Result Tabs Header */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/50">
        {renderTabButton('OVERVIEW', 'Overview', <Info size={16} />)}
        {renderTabButton('APPLICATIONS', 'Applications', <Layers size={16} />)}
        {renderTabButton('RESEARCH', 'Research', <BookOpen size={16} />)}
        {renderTabButton('ECOSYSTEM', 'News & Ecosystem', <Zap size={16} />)}
      </div>

      <div className="p-6 md:p-8 min-h-[400px]">
        <div className="animate-fade-in">
          {activeTab === 'OVERVIEW' && (
            <div>
               <h3 className="text-xl font-semibold text-slate-200 mb-4">Executive Summary</h3>
               <MarkdownRenderer content={sections.overview} />
               <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                 <p className="text-sm text-blue-200">
                   Select the tabs above to dive deeper into specific Applications, Research Papers, or Ecosystem news regarding this topic.
                 </p>
               </div>
            </div>
          )}
          {activeTab === 'APPLICATIONS' && (
            <div>
               <h3 className="text-xl font-semibold text-purple-300 mb-4">Applications & Tools</h3>
               <MarkdownRenderer content={sections.applications} />
            </div>
          )}
          {activeTab === 'RESEARCH' && (
             <div>
               <h3 className="text-xl font-semibold text-emerald-300 mb-4">Research & Papers</h3>
               <MarkdownRenderer content={sections.research} />
            </div>
          )}
          {activeTab === 'ECOSYSTEM' && (
             <div>
               <h3 className="text-xl font-semibold text-amber-300 mb-4">Ecosystem & Community</h3>
               <MarkdownRenderer content={sections.ecosystem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;