import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // A very basic markdown parser for the specific structure we requested.
  // In a production app with npm access, we would use 'react-markdown'.
  
  const sections = content.split('\n');

  return (
    <div className="space-y-4 text-slate-300 leading-relaxed">
      {sections.map((line, index) => {
        // Headers
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl md:text-2xl font-bold text-blue-400 mt-8 mb-4 border-b border-slate-700 pb-2">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
            return (
              <h3 key={index} className="text-lg font-semibold text-indigo-300 mt-6 mb-2">
                {line.replace('### ', '')}
              </h3>
            );
          }
        // Bold Key/Value pairs often returned by Gemini (e.g., **Name**: Description)
        if (line.trim().startsWith('- **') || line.trim().startsWith('* **')) {
             const cleanLine = line.replace(/^[\-\*]\s/, '');
             const parts = cleanLine.split('**');
             if (parts.length >= 3) {
                 return (
                     <div key={index} className="ml-4 mb-2">
                         <span className="text-yellow-100 font-bold">• {parts[1]}</span>
                         <span>{parts.slice(2).join('**')}</span>
                     </div>
                 )
             }
        }
        // List items
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={index} className="flex items-start ml-4 mb-2">
              <span className="mr-2 text-slate-500">•</span>
              <span>{line.replace(/^[\-\*]\s/, '').replace(/\*\*(.*?)\*\*/g, (_, p1) => p1)}</span> 
              {/* Basic regex to strip bold markers for cleaner list plain text if complex parsing fails, 
                  but ideally we keep bold. Let's try to keep bold in a simple way below */}
            </div>
          );
        }
        
        // Empty lines
        if (line.trim() === '') {
            return <div key={index} className="h-2"></div>;
        }

        // Paragraphs with simple bold parsing
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-2">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;