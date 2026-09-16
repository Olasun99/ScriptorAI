import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  'Reading',
  'Grammar',
  'Structure',
  'Style',
  'Originality',
  'Refinement'
];

export default function ProcessingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="space-y-6 w-64 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">Pipeline Progress</h3>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isCompleted || isCurrent ? 1 : 0.4, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : isCurrent 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-slate-200 text-transparent'
              }`}>
                {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : (isCurrent && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />)}
              </div>
              <span className={`text-sm font-medium ${isCompleted ? 'text-slate-800' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
        {currentStep >= STEPS.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-center text-[10px] text-slate-500 mt-6"
          >
            Processing large texts may take up to a minute...
          </motion.div>
        )}
      </div>
    </div>
  );
}
