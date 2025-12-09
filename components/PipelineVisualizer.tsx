import React from 'react';
import { ProcessingStage } from '../types';
import { ScanLine, BrainCircuit, Binary, FileCode, Calculator } from 'lucide-react';

interface PipelineVisualizerProps {
  stage: ProcessingStage;
}

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ stage }) => {
  const steps = [
    { id: 'preprocessing', label: 'Image Preprocessing', icon: ScanLine, desc: 'Denoising & Deskewing' },
    { id: 'ocr', label: 'Deep Learning OCR', icon: BrainCircuit, desc: 'CNN + Transformer' },
    { id: 'parsing', label: 'Symbolic Parsing', icon: FileCode, desc: 'LaTeX to AST' },
    { id: 'solving', label: 'Solver Engine', icon: Calculator, desc: 'Step-by-step Logic' },
  ];

  const getStatusColor = (stepId: string) => {
    const stages = ['idle', 'preprocessing', 'ocr', 'parsing', 'solving', 'complete'];
    const currentIndex = stages.indexOf(stage);
    const stepIndex = stages.indexOf(stepId);

    if (stage === 'error') return 'text-slate-300';
    if (stage === 'complete') return 'text-green-600 bg-green-50 border-green-200';
    if (currentIndex > stepIndex) return 'text-green-600 bg-green-50 border-green-200';
    if (currentIndex === stepIndex) return 'text-indigo-600 bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100';
    return 'text-slate-400 bg-white border-slate-100';
  };

  if (stage === 'idle' || stage === 'error') return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">Processing Pipeline</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const statusClass = getStatusColor(step.id);
          const isActive = stage === step.id;
          
          return (
            <div 
              key={step.id} 
              className={`
                relative p-4 rounded-xl border transition-all duration-500 flex flex-col items-center text-center
                ${statusClass}
                ${isActive ? 'scale-105 shadow-md' : 'scale-100'}
              `}
            >
              <div className={`mb-2 ${isActive ? 'animate-bounce' : ''}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="font-semibold text-sm">{step.label}</div>
              <div className="text-xs opacity-75 mt-1">{step.desc}</div>
              
              {isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualizer;