import React, { useState } from 'react';
import { MathSolution, Step } from '../types';
import MathRenderer from './MathRenderer';
import { ChevronDown, ChevronRight, CheckCircle2, Copy } from 'lucide-react';

interface SolutionDisplayProps {
  solution: MathSolution;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solution.finalAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
      
      {/* Header Info */}
      <div className="flex items-center justify-between text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <span>Type: <span className="font-semibold text-slate-700">{solution.problemType}</span></span>
        <span>Confidence: <span className="font-semibold text-green-600">{(solution.confidence * 100).toFixed(1)}%</span></span>
      </div>

      {/* Main Problem Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Original Expression</h2>
        </div>
        <div className="p-8 bg-white min-h-[120px] overflow-x-auto">
           <MathRenderer latex={solution.cleanedLatex || solution.originalLatex} display={true} className="text-2xl text-slate-800" />
        </div>
      </div>

      {/* Steps Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-4">
          <h2 className="text-lg font-bold text-indigo-900">Step-by-Step Reasoning</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {solution.steps.map((step, idx) => (
            <StepItem key={idx} step={step} index={idx + 1} />
          ))}
        </div>
      </div>

      {/* Final Answer */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg text-white overflow-hidden relative">
        <div className="px-6 py-4 bg-black/10 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-300" /> Final Answer
          </h2>
          <button 
            onClick={copyToClipboard}
            className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy LaTeX'}
          </button>
        </div>
        <div className="p-8 overflow-x-auto">
           <MathRenderer latex={solution.finalAnswer} display={true} className="text-3xl font-bold" />
        </div>
      </div>
    </div>
  );
};

const StepItem: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="group transition-colors hover:bg-slate-50/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left focus:outline-none"
      >
        <div className={`p-1 rounded-full ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <span className="font-mono text-xs text-slate-400">STEP {index}</span>
             {step.rule && (
               <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">
                 {step.rule}
               </span>
             )}
          </div>
          <p className="text-slate-700 font-medium text-sm mt-1">{step.explanation}</p>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pl-16 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-x-auto">
             <MathRenderer latex={step.latex} display={true} className="text-lg text-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionDisplay;