import React, { useState, FormEvent, useEffect } from 'react';
import { Search, Sparkles, Loader2, AlertCircle, Menu } from 'lucide-react';
import { searchLLMContext } from './services/geminiService';
import { SearchSession, SearchStatus, SearchCategory } from './types';
import SourceList from './components/SourceList';
import CategorySidebar from './components/CategorySidebar';
import SearchTabs from './components/SearchTabs';
import ResultDisplay from './components/ResultDisplay';

// Generator for unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- Multi-Tab State Management ---
  const [sessions, setSessions] = useState<SearchSession[]>([
    { 
      id: 'init-1', 
      query: '', 
      category: 'General', 
      status: SearchStatus.IDLE, 
      result: null, 
      error: null,
      timestamp: Date.now() 
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('init-1');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to get active session safely
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Helper to update active session
  const updateActiveSession = (updates: Partial<SearchSession>) => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, ...updates } : s
    ));
  };

  // --- Actions ---

  const handleNewTab = () => {
    const newId = generateId();
    const newSession: SearchSession = {
      id: newId,
      query: '',
      category: 'General',
      status: SearchStatus.IDLE,
      result: null,
      error: null,
      timestamp: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      // Don't close the last tab, just reset it
      setSessions([{ ...sessions[0], query: '', status: SearchStatus.IDLE, result: null, error: null }]);
      return;
    }

    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);

    // If we closed the active tab, switch to the last available one
    if (id === activeSessionId) {
      setActiveSessionId(newSessions[newSessions.length - 1].id);
    }
  };

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    const currentQuery = activeSession.query;
    const currentCategory = activeSession.category;

    if (!currentQuery.trim()) return;

    // Update status to loading
    updateActiveSession({ status: SearchStatus.LOADING, error: null, result: null });
    setIsMobileMenuOpen(false);

    try {
      const data = await searchLLMContext(currentQuery, currentCategory);
      updateActiveSession({ status: SearchStatus.SUCCESS, result: data });
    } catch (err) {
      console.error(err);
      updateActiveSession({ 
        status: SearchStatus.ERROR, 
        error: "Failed to retrieve search results. Please verify your API key and network connection." 
      });
    }
  };

  const handleCategoryChange = (newCategory: SearchCategory) => {
    // Update category in state
    updateActiveSession({ category: newCategory });
    
    // If we have a query and a successful result (or was loading), auto-trigger search with new category
    if (activeSession.query.trim() && activeSession.status === SearchStatus.SUCCESS) {
       // We need to trigger the search, but since state updates are async, 
       // we call the service directly with the new value
       // However, to keep it clean, let's just trigger a re-search effect or call it directly.
       // For simplicity, we'll manually call the async logic here mirroring handleSearch
       (async () => {
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, status: SearchStatus.LOADING, category: newCategory, error: null, result: null } : s));
          try {
            const data = await searchLLMContext(activeSession.query, newCategory);
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, status: SearchStatus.SUCCESS, result: data } : s));
          } catch (err) {
             setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, status: SearchStatus.ERROR, error: "Failed." } : s));
          }
       })();
    }
  };

  // --- Render Helpers ---

  const SuggestionChip = ({ label }: { label: string }) => (
    <button
      onClick={() => {
        updateActiveSession({ query: label });
        // Small timeout to allow state to update before triggering search
        setTimeout(() => {
           // We need to access the latest state, so we pass the label directly to a custom search call
           // Or just force the update above and call a one-off search function
           // Easiest is to update state then manually call service
           setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, query: label, status: SearchStatus.LOADING, result: null } : s));
           searchLLMContext(label, activeSession.category)
             .then(data => setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, status: SearchStatus.SUCCESS, result: data } : s)))
             .catch(() => setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, status: SearchStatus.ERROR, error: "Failed" } : s)));
        }, 0);
      }}
      className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 flex">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Sidebar (Desktop) */}
      <CategorySidebar selectedCategory={activeSession.category} onSelectCategory={handleCategoryChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full max-w-full overflow-hidden">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0f172a]/90 sticky top-0 z-50">
           <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">OmniSearch</span>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
             <Menu size={24} />
           </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 z-40 shadow-xl">
             <div className="grid grid-cols-2 gap-2">
                {(['General', 'Health', 'Emotion', 'Business', 'Education', 'Creative'] as SearchCategory[]).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`p-3 rounded-lg text-sm font-medium ${activeSession.category === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-screen">
          
          {/* Top Bar: Tabs */}
          <SearchTabs 
            sessions={sessions} 
            activeId={activeSessionId} 
            onSwitch={setActiveSessionId} 
            onClose={handleCloseTab} 
            onNew={handleNewTab}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
            {/* Search Header Area */}
            <div className={`transition-all duration-500 ease-in-out flex flex-col items-center ${activeSession.status === SearchStatus.IDLE ? 'justify-center min-h-[50vh]' : 'justify-start mb-8'}`}>
              
              {activeSession.status === SearchStatus.IDLE && (
                <div className="text-center mb-8 animate-fade-in">
                  <h1 className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-4xl md:text-6xl mb-4">
                    OmniSearch
                  </h1>
                  <p className="text-slate-400 text-lg">
                    {activeSession.category === 'General' ? 'Unified intelligence.' : `Exploring ${activeSession.category}.`}
                  </p>
                </div>
              )}

              {/* Search Input */}
              <div className={`w-full transition-all duration-500 ${activeSession.status === SearchStatus.IDLE ? 'max-w-2xl' : 'max-w-4xl'}`}>
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`text-slate-500 group-focus-within:text-blue-400 transition-colors ${activeSession.status === SearchStatus.LOADING ? 'animate-pulse' : ''}`} />
                  </div>
                  <input
                    type="text"
                    value={activeSession.query}
                    onChange={(e) => updateActiveSession({ query: e.target.value })}
                    placeholder={`Search ${activeSession.category}...`}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-black/20"
                    disabled={activeSession.status === SearchStatus.LOADING}
                  />
                  <button 
                    type="submit"
                    disabled={activeSession.status === SearchStatus.LOADING || !activeSession.query.trim()}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {activeSession.status === SearchStatus.LOADING ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Explore</span>
                        <Sparkles size={16} />
                      </>
                    )}
                  </button>
                </form>
                
                {/* Suggestions (Only when Idle) */}
                {activeSession.status === SearchStatus.IDLE && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {activeSession.category === 'General' && (
                      <>
                        <SuggestionChip label="Gemini vs GPT-4" />
                        <SuggestionChip label="DeepSeek Architecture" />
                      </>
                    )}
                    {activeSession.category === 'Health' && (
                      <>
                         <SuggestionChip label="Med-PaLM 2 Papers" />
                         <SuggestionChip label="AI in Radiology" />
                      </>
                    )}
                    {activeSession.category === 'Emotion' && (
                         <SuggestionChip label="Sentiment Analysis Trends" />
                    )}
                     {activeSession.category === 'Business' && (
                      <SuggestionChip label="Enterprise LLM Adoption" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error State */}
            {activeSession.status === SearchStatus.ERROR && (
              <div className="max-w-4xl mx-auto w-full p-6 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4 text-red-200 animate-fade-in">
                <AlertCircle className="shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Search Failed</h3>
                  <p>{activeSession.error}</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {activeSession.status === SearchStatus.SUCCESS && activeSession.result && (
              <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up">
                
                {/* Main Content Column */}
                <main className="xl:col-span-8 space-y-6">
                  <ResultDisplay result={activeSession.result} />
                </main>

                {/* Sidebar Column */}
                <aside className="xl:col-span-4 space-y-6">
                  <SourceList sources={activeSession.result.sources} />
                  
                  <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-xl p-5 border border-indigo-500/20">
                    <h4 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                      <Sparkles size={16} />
                      {activeSession.category} Intelligence
                    </h4>
                    <p className="text-sm text-slate-400">
                      Multi-source synthesis complete. Use the tabs on the left to confirm or modify the context.
                    </p>
                  </div>
                </aside>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;