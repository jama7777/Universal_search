import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, AlertCircle, Menu, Send, Bot, User, Download } from 'lucide-react';
import { searchLLMContext } from './services/geminiService';
import { SearchSession, SearchStatus, SearchCategory, ChatMessage } from './types';
import CategorySidebar from './components/CategorySidebar';
import SearchTabs from './components/SearchTabs';
import ResultDisplay from './components/ResultDisplay';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Generator for unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- Multi-Tab State Management ---
  const [sessions, setSessions] = useState<SearchSession[]>([
    { 
      id: 'init-1', 
      title: 'New Chat',
      category: 'General', 
      status: SearchStatus.IDLE, 
      messages: [],
      error: null,
      lastUpdated: Date.now() 
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('init-1');
  const [inputValue, setInputValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get active session safely
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isExporting) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession.messages.length, activeSession.status, isExporting]);

  // Helper to update active session
  const updateActiveSession = (updates: Partial<SearchSession>) => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, ...updates } : s
    ));
  };

  const handleNewTab = () => {
    const newId = generateId();
    const newSession: SearchSession = {
      id: newId,
      title: 'New Chat',
      category: 'General',
      status: SearchStatus.IDLE,
      messages: [],
      error: null,
      lastUpdated: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      setSessions([{ ...sessions[0], title: 'New Chat', messages: [], status: SearchStatus.IDLE, error: null }]);
      return;
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (id === activeSessionId) {
      setActiveSessionId(newSessions[newSessions.length - 1].id);
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const currentQuery = inputValue;
    const currentCategory = activeSession.category;

    setInputValue('');
    setIsMobileMenuOpen(false);

    // Add User Message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: currentQuery,
      timestamp: Date.now()
    };

    // Update Title if it's the first message
    const titleUpdate = activeSession.messages.length === 0 ? { title: currentQuery } : {};

    const updatedMessages = [...activeSession.messages, userMsg];

    updateActiveSession({ 
      messages: updatedMessages,
      status: SearchStatus.LOADING,
      error: null,
      ...titleUpdate
    });

    try {
      const { text, sources } = await searchLLMContext(currentQuery, currentCategory, activeSession.messages);
      
      const modelMsg: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: text,
        sources: sources,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { 
          ...s, 
          messages: [...updatedMessages, modelMsg], 
          status: SearchStatus.SUCCESS 
        } : s
      ));

    } catch (err) {
      console.error(err);
      updateActiveSession({ 
        status: SearchStatus.ERROR, 
        error: "Failed to retrieve response. Check connection." 
      });
    }
  };

  const handleExportPDF = async () => {
    if (!chatContainerRef.current) return;
    setIsExporting(true);
    
    try {
      const element = chatContainerRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // Retain quality
        useCORS: true,
        backgroundColor: '#0f172a',
        ignoreElements: (node) => node.classList.contains('no-print') // Helper class if needed
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`omnisearch-${activeSession.title || 'chat'}.pdf`);

    } catch (error) {
      console.error("Export failed:", error);
      alert("Could not export PDF. Please try using browser Print -> Save as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCategoryChange = (newCategory: SearchCategory) => {
    updateActiveSession({ category: newCategory });
  };

  // --- Render Helpers ---
  const SuggestionChip = ({ label }: { label: string }) => (
    <button
      onClick={() => setInputValue(label)}
      className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer whitespace-nowrap"
    >
      {label}
    </button>
  );

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 flex overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/05 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/05 blur-[100px]" />
      </div>

      <CategorySidebar selectedCategory={activeSession.category} onSelectCategory={handleCategoryChange} />

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-full h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0f172a]/90 shrink-0">
           <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">OmniSearch</span>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
             <Menu size={24} />
           </button>
        </div>

        {/* Mobile Menu */}
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

        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 pt-4 pb-0 h-full overflow-hidden">
          
          <div className="flex items-center gap-2 w-full mb-2 shrink-0">
             <div className="flex-1 overflow-hidden">
                <SearchTabs 
                  sessions={sessions} 
                  activeId={activeSessionId} 
                  onSwitch={setActiveSessionId} 
                  onClose={handleCloseTab} 
                  onNew={handleNewTab}
                />
             </div>
             {activeSession.messages.length > 0 && (
               <button 
                 onClick={handleExportPDF}
                 disabled={isExporting}
                 className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                 title="Export Chat to PDF"
               >
                 {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                 <span>Export PDF</span>
               </button>
             )}
          </div>

          {/* Chat Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar pb-4 space-y-6 px-2"
          >
            {activeSession.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-2">OmniSearch AI</h2>
                <p className="text-slate-400 max-w-md mb-8">
                  Exploring <strong>{activeSession.category}</strong>. Ask anything to get real-time results from papers, applications, and news.
                </p>
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                    <SuggestionChip label="Latest LLM Architectures" />
                    <SuggestionChip label="Medical AI Research" />
                    <SuggestionChip label="Generative Art Tools" />
                </div>
              </div>
            )}

            {activeSession.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[95%] lg:max-w-[90%] w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {msg.role === 'user' ? (
                     <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tr-none border border-slate-700">
                        {msg.text}
                     </div>
                  ) : (
                     // ResultDisplay now handles the layout of content + source list
                     <ResultDisplay result={{ markdownText: msg.text, sources: msg.sources || [] }} />
                  )}
                </div>
              </div>
            ))}

            {activeSession.status === SearchStatus.LOADING && (
               <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-blue-600/50 rounded-lg flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-white" />
                  </div>
                  <div className="bg-slate-900/50 h-32 w-full max-w-2xl rounded-2xl border border-slate-800"></div>
               </div>
            )}

            {activeSession.status === SearchStatus.ERROR && (
               <div className="flex gap-4">
                 <AlertCircle className="text-red-400" />
                 <p className="text-red-400">{activeSession.error}</p>
               </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 py-4 bg-[#0f172a] z-20 no-print">
            <div className="relative max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message OmniSearch (${activeSession.category})...`}
                  className="block w-full pl-5 pr-14 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-black/20"
                  disabled={activeSession.status === SearchStatus.LOADING}
                />
                <button 
                  type="submit"
                  disabled={activeSession.status === SearchStatus.LOADING || !inputValue.trim()}
                  className="absolute right-2 top-2 bottom-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {activeSession.status === SearchStatus.LOADING ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
              <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-600">
                    AI may produce inaccurate information. Sources are grounded via Google Search.
                 </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;