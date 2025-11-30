import React, { useState, FormEvent } from 'react';
import { Search, Sparkles, BookOpen, Layers, Zap, Loader2, AlertCircle, Menu } from 'lucide-react';
import { searchLLMContext } from './services/geminiService';
import { SearchResult, SearchStatus, SearchCategory } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import SourceList from './components/SourceList';
import CategorySidebar from './components/CategorySidebar';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('General');
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reusable search function
  const performSearch = async (searchQuery: string, searchCategory: SearchCategory) => {
    if (!searchQuery.trim()) return;

    setStatus(SearchStatus.LOADING);
    setErrorMsg(null);
    setResult(null);
    // Close mobile menu if open
    setIsMobileMenuOpen(false);

    try {
      const data = await searchLLMContext(searchQuery, searchCategory);
      setResult(data);
      setStatus(SearchStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(SearchStatus.ERROR);
      setErrorMsg("Failed to retrieve search results. Please verify your API key and network connection.");
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch(query, category);
  };

  const handleCategoryChange = (newCategory: SearchCategory) => {
    setCategory(newCategory);
    if (query.trim() && status === SearchStatus.SUCCESS) {
        // If we already have results, auto-refresh with new category
        performSearch(query, newCategory);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 flex">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Sidebar (Desktop) */}
      <CategorySidebar selectedCategory={category} onSelectCategory={handleCategoryChange} />

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
                    className={`p-3 rounded-lg text-sm font-medium ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          
          {/* Header Area */}
          <header className={`transition-all duration-500 ease-in-out flex flex-col items-center ${status === SearchStatus.IDLE ? 'justify-center min-h-[60vh]' : 'justify-start pt-4 pb-8'}`}>
            <div className="text-center mb-8">
              <h1 className={`font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500 ${status === SearchStatus.IDLE ? 'text-5xl md:text-7xl mb-4' : 'text-3xl md:text-4xl mb-2'}`}>
                OmniSearch
              </h1>
              <p className={`text-slate-400 transition-all duration-500 ${status === SearchStatus.IDLE ? 'text-lg md:text-xl max-w-2xl mx-auto' : 'text-sm md:text-base hidden md:block'}`}>
                {category === 'General' ? 'Unified intelligence for LLMs, Applications, and Research.' : `Exploring ${category} Intelligence`}
              </p>
            </div>

            {/* Search Bar */}
            <div className={`w-full transition-all duration-500 ${status === SearchStatus.IDLE ? 'max-w-2xl' : 'max-w-4xl'}`}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className={`text-slate-500 group-focus-within:text-blue-400 transition-colors ${status === SearchStatus.LOADING ? 'animate-pulse' : ''}`} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search for ${category.toLowerCase()} concepts...`}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-black/20"
                  disabled={status === SearchStatus.LOADING}
                />
                <button 
                  type="submit"
                  disabled={status === SearchStatus.LOADING || !query.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === SearchStatus.LOADING ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="hidden sm:inline">Searching...</span>
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
              {status === SearchStatus.IDLE && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {category === 'General' && (
                    <>
                      <SuggestionChip label="Gemini vs GPT-4" onClick={() => { setQuery("Gemini vs GPT-4"); performSearch("Gemini vs GPT-4", category); }} />
                      <SuggestionChip label="DeepSeek Architecture" onClick={() => { setQuery("DeepSeek Architecture"); performSearch("DeepSeek Architecture", category); }} />
                    </>
                  )}
                  {category === 'Health' && (
                    <>
                       <SuggestionChip label="Med-PaLM 2 Papers" onClick={() => { setQuery("Med-PaLM 2 Papers"); performSearch("Med-PaLM 2 Papers", category); }} />
                       <SuggestionChip label="AI in Radiology" onClick={() => { setQuery("AI in Radiology"); performSearch("AI in Radiology", category); }} />
                    </>
                  )}
                  {category === 'Emotion' && (
                    <>
                       <SuggestionChip label="Sentiment Analysis Trends" onClick={() => { setQuery("Sentiment Analysis Trends"); performSearch("Sentiment Analysis Trends", category); }} />
                       <SuggestionChip label="Empathetic Chatbots" onClick={() => { setQuery("Empathetic Chatbots"); performSearch("Empathetic Chatbots", category); }} />
                    </>
                  )}
                   {category === 'Business' && (
                    <SuggestionChip label="Enterprise LLM Adoption" onClick={() => { setQuery("Enterprise LLM Adoption"); performSearch("Enterprise LLM Adoption", category); }} />
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Content Area */}
          {status === SearchStatus.ERROR && (
            <div className="max-w-4xl mx-auto w-full p-6 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4 text-red-200 animate-fade-in">
              <AlertCircle className="shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Search Failed</h3>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {status === SearchStatus.SUCCESS && result && (
            <div className="w-full flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up pb-12">
              
              {/* Main Content Column */}
              <main className="xl:col-span-8 space-y-6">
                
                {/* Feature Cards / Navigation Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <FeatureCard icon={<Layers className="text-purple-400" />} title="Applications" description={`${category} Tools`} />
                  <FeatureCard icon={<BookOpen className="text-emerald-400" />} title="Research" description="Field Papers" />
                  <FeatureCard icon={<Zap className="text-amber-400" />} title="Ecosystem" description="Domain News" />
                </div>

                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                  <MarkdownRenderer content={result.markdownText} />
                </div>
              </main>

              {/* Sidebar Column */}
              <aside className="xl:col-span-4 space-y-6">
                <SourceList sources={result.sources} />
                
                <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-xl p-5 border border-indigo-500/20">
                  <h4 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                    <Sparkles size={16} />
                    Context Aware
                  </h4>
                  <p className="text-sm text-slate-400">
                    Results are tailored to the <strong>{category}</strong> domain using real-time search grounding.
                  </p>
                </div>
              </aside>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components

const SuggestionChip: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
  >
    {label}
  </button>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center gap-4">
    <div className="p-2 bg-slate-900 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="font-medium text-slate-200">{title}</h3>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </div>
);

export default App;