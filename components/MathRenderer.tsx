import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: {
      typesetPromise?: (elements: (HTMLElement | null)[]) => Promise<void>;
    };
  }
}

interface MathRendererProps {
  latex: string;
  display?: boolean; // Block or inline
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ latex, display = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      // Clear previous content to prevent duplication artifacts
      containerRef.current.innerHTML = '';
      
      // Create a span for the new content
      const span = document.createElement('span');
      // Wrap in delimiters expected by our MathJax config
      span.innerHTML = display ? `$$${latex}$$` : `$${latex}$`;
      containerRef.current.appendChild(span);

      // Tell MathJax to typeset this specific node
      window.MathJax.typesetPromise?.([containerRef.current]).catch((err: any) => console.error('MathJax Typeset failed: ', err));
    }
  }, [latex,display]);

  return <div ref={containerRef} className={`${className} ${display ? 'my-2' : 'inline-block'}`} />;
};

export default MathRenderer;