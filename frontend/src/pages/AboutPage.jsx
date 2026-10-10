import React from 'react';
import { Network, Database, ShieldAlert, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900">About the Model</h1>
        <p className="text-gray-500 mt-1">Details on the architecture, dataset, and performance of FreshFind's AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border-t-4 border-t-cyan-500 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-cyan-50 p-2 rounded-lg"><Network className="w-6 h-6 text-cyan-600" /></div>
            <h2 className="text-xl font-display font-semibold text-navy-900">Architecture</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            The core engine utilizes an <strong>EfficientNetB0</strong> convolutional neural network. 
            By leveraging transfer learning and fine-tuning specifically on produce textures and colors, the model achieves high parameter efficiency while maintaining state-of-the-art accuracy.
          </p>
        </div>

        <div className="card border-t-4 border-t-sage-500 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-sage-50 p-2 rounded-lg"><Database className="w-6 h-6 text-sage-600" /></div>
            <h2 className="text-xl font-display font-semibold text-navy-900">Training Data</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Trained on the highly curated <strong>Freshness44 dataset</strong> containing <strong>53,616 diverse images</strong>. The dataset spans exactly <strong>22 produce categories</strong>, strictly labeled into binary <em>Fresh</em> and <em>Rotten</em> classes.
          </p>
        </div>
      </div>

      <div className="bg-navy-900 rounded-2xl p-8 text-white shadow-float relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center space-x-4 mb-6">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-display font-bold">Recorded Performance</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-1">Held-Out Test Accuracy</p>
            <p className="text-5xl font-display font-bold">98.56%</p>
          </div>
          <div>
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-1">Test AUC Score</p>
            <p className="text-5xl font-display font-bold">99.92%</p>
          </div>
        </div>
      </div>

      <div className="bg-cream-100/50 rounded-2xl p-6 border border-cream-200">
        <div className="flex space-x-4 items-start">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-navy-900 text-lg mb-1">Important Disclaimer</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              While the model exhibits high accuracy on the validation sets, <strong>real-world results depend heavily on image quality</strong>, lighting, and angles. The model detects visual signs of spoilage (like bruising or mold) but <strong>cannot detect pathogens, chemical contamination, or guarantee food safety</strong>. When in doubt regarding food safety, always exercise common sense.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
