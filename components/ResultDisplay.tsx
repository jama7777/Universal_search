import React, { useState, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { SearchResult } from '../types';
import SourceList, { getCategory } from './SourceList';
import { Layers, BookOpen, Zap, Info } from 'lucide-react';

interface ResultDisplayProps {
  result: SearchResult;
}

type SectionTab = 'OVERVIEW' | 'APPLICATIONS' | 'RESEARCH' | 'ECOSYSTEM';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('OVERVIEW');

  // Split content based on Headers defined in the Prompt
  // Improved Regex to handle slight variations in model output like "## 1 " or "## 1."
  const sections = useMemo(() => {
    const text = result.markdownText || ""; // Defensive check
    // Regex matches: newline (optional) + ## + spaces + digit + optional dot + space
    const parts = text.split(/\n?##\s*\d+\.?\s+/);
    
    return {
      overview: parts[0]?.trim() || "",
      applications: parts[1]?.trim() || "",
      research: parts[2]?.trim() || "",
      ecosystem: parts[3]?.trim() || ""
    };
  }, [result.markdownText]);

  // Filter sources based on active tab
  const filteredSources = useMemo(() => {
    if (!result.sources) return [];
    
    // Overview shows everything to give broad context
    if (activeTab === 'OVERVIEW') return result.sources;

    return result.sources.filter(source => {
      const cat = getCategory(source.uri);
      if (activeTab === 'RESEARCH') return cat === 'PAPER';
      if (activeTab === 'APPLICATIONS') return cat === 'APP';
      if (activeTab === 'ECOSYSTEM') return cat === 'GENERAL';
      return true;
    });
  }, [result.sources, activeTab]);

  // If parsing failed (length check), fall back to simple renderer.
  // We check if we actually have content in the split sections.
  const isParsedCorrectly = !!(sections.applications || sections.research);

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

  const renderContent = () => {
    // Defensive check if text is empty or missing
    if (!result.markdownText) {
        return <p className="text-slate-500 italic">No content available.</p>;
    }

    if (!isParsedCorrectly) {
       return <MarkdownRenderer content={result.markdownText} />;
    }

    return (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Result Tabs Header */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/50">
          {renderTabButton('OVERVIEW', 'Overview', <Info size={16} />)}
          {renderTabButton('APPLICATIONS', 'Applications', <Layers size={16} />)}
          {renderTabButton('RESEARCH', 'Research', <BookOpen size={16} />)}
          {renderTabButton('ECOSYSTEM', 'News & Ecosystem', <Zap size={16} />)}
        </div>

        <div className="p-6 md:p-8 min-h-[200px]">
          <div className="animate-fade-in">
            {activeTab === 'OVERVIEW' && (
              <div>
                 <h3 className="text-xl font-semibold text-slate-200 mb-4">Executive Summary</h3>
                 <MarkdownRenderer content={sections.overview} />
                 {/* Also show a summary of other sections if overview is brief? No, keep it clean. */}
                 {sections.overview.length < 50 && (
                     <p className="text-slate-400 italic">Select tabs to view detailed results.</p>
                 )}
                 <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                   <p className="text-sm text-blue-200">
                     Select the tabs above to dive deeper into specific Applications, Research Papers, or Ecosystem news.
                     The reference list on the right will update to match your focus.
                   </p>
                 </div>
              </div>
            )}
            {activeTab === 'APPLICATIONS' && (
              <div>
                 <h3 className="text-xl font-semibold text-purple-300 mb-4">Applications & Tools</h3>
                 {sections.applications ? <MarkdownRenderer content={sections.applications} /> : <p className="text-slate-500">No specific applications found.</p>}
              </div>
            )}
            {activeTab === 'RESEARCH' && (
               <div>
                 <h3 className="text-xl font-semibold text-emerald-300 mb-4">Research & Papers</h3>
                 {sections.research ? <MarkdownRenderer content={sections.research} /> : <p className="text-slate-500">No specific research papers found.</p>}
              </div>
            )}
            {activeTab === 'ECOSYSTEM' && (
               <div>
                 <h3 className="text-xl font-semibold text-amber-300 mb-4">Ecosystem & Community</h3>
                 {sections.ecosystem ? <MarkdownRenderer content={sections.ecosystem} /> : <p className="text-slate-500">No ecosystem news found.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
      
      {/* Dynamic Source List */}
      {(filteredSources.length > 0) && (
        <div className="xl:w-64 shrink-0">
           <SourceList sources={filteredSources} />
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;