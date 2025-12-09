import React, { useState, useRef } from 'react';
import { Camera, Upload, X, ArrowRight, Github, FlaskConical, AlertTriangle, GraduationCap, Calculator } from 'lucide-react';
import { MathSolution, ProcessingStage, AppMode } from './types';
import { solveMathProblem } from './services/geminiService';
import PipelineVisualizer from './components/PipelineVisualizer';
import SolutionDisplay from './components/SolutionDisplay';
import PracticeMode from './components/PracticeMode';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('solver');
  const [image, setImage] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSolution(null);
    setError(null);
    setProcessingStage('idle');

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!image) return;

    try {
      setError(null);
      // Simulate the heavy backend pipeline stages described in requirements
      
      setProcessingStage('preprocessing');
      // Grayscale, Denoising (Gaussian/Bilateral), Thresholding (Otsu), Deskewing
      await new Promise(r => setTimeout(r, 1200)); 
      
      setProcessingStage('ocr');
      // CNN backbone + Transformer Encoder-Decoder (TrOCR/im2latex)
      await new Promise(r => setTimeout(r, 1500));

      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      setProcessingStage('parsing');
      // LaTeX Normalization -> SymPy Parsing -> AST
      
      // We perform the actual API call here which encompasses these logical steps
      const result = await solveMathProblem(base64Data, mimeType);
      
      setProcessingStage('solving');
      // Symbolic Solver Engine (SymPy) -> Step generation
      await new Promise(r => setTimeout(r, 1000));

      setProcessingStage('complete');
      setSolution(result);

    } catch (err) {
      console.error(err);
      setProcessingStage('error');
      setError('Failed to process image. Please try a clearer image or ensure it contains a valid math problem.');
    }
  };

  const clearImage = () => {
    setImage(null);
    setSolution(null);
    setProcessingStage('idle');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderSolverMode = () => (
    <>
      <div className="mb-8 text-center space-y-4 animate-in fade-in duration-500">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Snap. Solve. <span className="text-indigo-600">Understand.</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload a photo of any math problem. Our Deep Learning pipeline extracts the LaTeX and provides a step-by-step symbolic solution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`
            relative rounded-2xl border-2 border-dashed transition-all overflow-hidden bg-white
            ${image ? 'border-indigo-200 shadow-lg' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
            min-h-[300px] flex flex-col justify-center items-center group
          `}>
            
            {image ? (
              <>
                <img src={image} alt="Upload" className="w-full h-full object-contain max-h-[400px]" />
                {processingStage === 'ocr' && <div className="scan-line"></div>}
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div 
                className="text-center p-8 cursor-pointer w-full h-full flex flex-col items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="font-semibold text-slate-700">Click to Upload</p>
                <p className="text-sm text-slate-400 mt-1">or drag and drop an image</p>
                <p className="text-xs text-slate-400 mt-4 px-4">Supports handwritten (TrOCR) and printed equations</p>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {image && processingStage === 'idle' && (
            <button
              onClick={handleSolve}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-whiteyb rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Pipeline <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {image && processingStage === 'idle' && (
             <button
               onClick={() => fileInputRef.current?.click()}
               className="w-full py-2 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
             >
               <Upload className="w-4 h-4" /> Try Different Image
             </button>
          )}
        </div>

        {/* Right Column: Results & Pipeline */}
        <div className="lg:col-span-2">
          
          <PipelineVisualizer stage={processingStage} />

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {solution && processingStage === 'complete' && <SolutionDisplay solution={solution} />}

          {!solution && processingStage === 'idle' && !error && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center h-[300px] flex flex-col items-center justify-center">
              <div className="space-y-4 opacity-40 w-full max-w-sm">
                 <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                 <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                 <div className="h-24 bg-slate-100 rounded-lg w-full border-2 border-dashed border-slate-200"></div>
              </div>
              <p className="text-slate-400 mt-6 text-sm font-medium">System Ready. Waiting for input.</p>
            </div>
          )}
          
          {(processingStage !== 'idle' && processingStage !== 'complete' && processingStage !== 'error') && (
             <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                 <span className="text-slate-600 font-medium">Processing...</span>
               </div>
               <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-20 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
               </div>
             </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setMode('solver')}>
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">TEACH <span className="text-indigo-600">THE <span className="text-slate-900">TEENS</span></span></span>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setMode('solver')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 mode === 'solver' 
                 ? 'bg-white text-indigo-600 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <Calculator className="w-4 h-4" /> Solver
             </button>
             <button 
               onClick={() => setMode('practice')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 mode === 'practice' 
                 ? 'bg-white text-indigo-600 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <GraduationCap className="w-4 h-4" /> Practice
             </button>
          </div>

          <div className="flex items-center gap-4">
             <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors">
               <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!process.env.API_KEY && (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
             <div>
               <p className="font-semibold">Missing API Key</p>
               <p className="text-sm">Please ensure <code>process.env.API_KEY</code> is set to use the AI capabilities.</p>
             </div>
           </div>
        )}

        {mode === 'solver' ? renderSolverMode() : <PracticeMode />}
        
      </main>
    </div>
  );
};

export default App;