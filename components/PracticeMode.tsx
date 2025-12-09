import React, { useState, useRef } from 'react';
import { generatePracticeQuestion, gradeAnswer } from '../services/geminiService';
import { QuizQuestion, GradingResult } from '../types';
import MathRenderer from './MathRenderer';
import { RefreshCw, Send, CheckCircle, XCircle, HelpCircle, ArrowRight, Camera, Image as ImageIcon, X, Signal, SignalHigh, SignalLow } from 'lucide-react';

const PracticeMode: React.FC = () => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setGrading(null);
    setUserAnswer('');
    setAnswerImage(null);
    try {
      const q = await generatePracticeQuestion(difficulty);
      setQuestion(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch new question when difficulty changes, but only if we are not currently working on a question or if it's the initial load
  // Actually, let's just make the user click the button to confirm difficulty change to avoid losing work, 
  // but we can trigger it initially.
  
  const handleDifficultyChange = (level: 'Easy' | 'Medium' | 'Hard') => {
    if (difficulty === level) return;
    setDifficulty(level);
    // Optional: Auto-fetch new question on difficulty change? 
    // Let's reset the current question to null to force a refresh on next "fetch" or we can just fetch immediately.
    // Ideally, we want the user to explicitly request a new question, so we update state and they hit "New Question".
    // However, to make it responsive, let's clear the current question if it's just sitting there unsolved.
    if (!grading && !userAnswer && !answerImage) {
        // We'll let the effect or manual trigger handle it, 
        // but for better UX, let's just trigger the fetch manually in the UI via the refresh button 
        // or we can auto-trigger here. Let's auto-trigger for smoothness.
        // We need to use the new level, so we pass it to a helper or just rely on state in next render? 
        // State updates are async. Let's direct call.
        setLoading(true);
        generatePracticeQuestion(level).then(q => {
             setQuestion(q);
             setLoading(false);
        });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        setAnswerImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAnswerImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!question || (!userAnswer.trim() && !answerImage)) return;
    setIsGrading(true);
    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (answerImage) {
        imageBase64 = answerImage.split(',')[1];
        mimeType = answerImage.split(';')[0].split(':')[1];
      }

      const result = await gradeAnswer(question.latex, userAnswer, imageBase64, mimeType);
      setGrading(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGrading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    if (!question) fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Practice Arena</h2>
           <p className="text-slate-500 text-sm">Select difficulty and solve.</p>
        </div>
        
        {/* Difficulty Selector */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center shadow-sm">
           <button 
             onClick={() => handleDifficultyChange('Easy')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
               difficulty === 'Easy' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             <SignalLow className="w-4 h-4" /> Easy
           </button>
           <button 
             onClick={() => handleDifficultyChange('Medium')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
               difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             <Signal className="w-4 h-4" /> Medium
           </button>
           <button 
             onClick={() => handleDifficultyChange('Hard')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
               difficulty === 'Hard' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             <SignalHigh className="w-4 h-4" /> Hard
           </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[200px] flex flex-col relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
             <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-sm font-medium text-indigo-600">Generating {difficulty} Problem...</p>
             </div>
          </div>
        ) : null}

        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-slate-700">Problem</span>
             {question && (
               <span className={`text-xs px-2 py-0.5 rounded-full border ${
                 question.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' :
                 question.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                 'bg-red-100 text-red-700 border-red-200'
               }`}>
                 {question.difficulty}
               </span>
             )}
             {question && <span className="text-xs text-slate-500 font-medium px-2">{question.topic}</span>}
          </div>
          <button 
            onClick={fetchQuestion}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
            title="New Question"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow w-full overflow-x-auto flex p-10">
           <div className="m-auto">
             {question && <MathRenderer latex={question.latex} display={true} className="text-2xl" />}
           </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        {answerImage && (
          <div className="relative inline-block group">
            <img src={answerImage} alt="Solution" className="h-32 w-auto rounded-lg border border-slate-200 shadow-sm" />
            <button 
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center gap-2">
           <button
             onClick={() => fileInputRef.current?.click()}
             className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
             title="Upload Image of Solution"
             disabled={loading || isGrading || !!grading}
           >
             <Camera className="w-5 h-5" />
           </button>
           <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
           />
           
           <input
             type="text"
             value={userAnswer}
             onChange={(e) => setUserAnswer(e.target.value)}
             placeholder={answerImage ? "Add optional notes..." : "Type LaTeX answer or upload image..."}
             className="flex-grow p-4 bg-transparent outline-none text-lg text-slate-800 placeholder:text-slate-300 font-mono"
             onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
             disabled={loading || isGrading || !!grading}
           />
           <button
              onClick={handleSubmit}
              disabled={(!userAnswer.trim() && !answerImage) || loading || isGrading || !!grading}
              className={`p-3 rounded-xl transition-all ${
                 (!userAnswer.trim() && !answerImage) || loading || !!grading
                 ? 'bg-slate-100 text-slate-400' 
                 : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
              }`}
           >
             {isGrading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
           </button>
        </div>
      </div>

      {/* Feedback Area */}
      {grading && (
        <div className={`rounded-2xl border p-6 animate-in slide-in-from-bottom-2 ${
          grading.isCorrect 
            ? 'bg-green-50 border-green-100' 
            : 'bg-amber-50 border-amber-100'
        }`}>
          <div className="flex items-start gap-4">
             <div className={`p-2 rounded-full ${grading.isCorrect ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
               {grading.isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
             </div>
             <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-lg ${grading.isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                    {grading.isCorrect ? 'Excellent Work!' : 'Review Needed'}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    grading.score >= 8 ? 'bg-green-100 text-green-700 border-green-200' :
                    grading.score >= 5 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    Score: {grading.score}/10
                  </div>
                </div>
                
                <p className={`${grading.isCorrect ? 'text-green-700' : 'text-amber-700'} mb-4 leading-relaxed`}>
                  {grading.feedback}
                </p>
                
                {!grading.isCorrect && (
                  <div className="bg-white/60 rounded-lg p-4 border border-amber-200/50">
                    <p className="text-xs font-bold text-amber-500 uppercase mb-2">Correct Solution</p>
                    <MathRenderer latex={grading.correctSolution} display={true} className="text-slate-800" />
                  </div>
                )}
             </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={fetchQuestion}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                grading.isCorrect 
                 ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                 : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200'
              }`}
            >
              Next Problem <ArrowRight className="inline-block w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-400 mt-8">
        <HelpCircle className="w-3 h-3 inline-block mr-1" />
        Tip: You can use standard LaTeX notation or upload a photo of your handwritten work.
      </div>
    </div>
  );
};

export default PracticeMode;