import React, { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw, AlertCircle, Leaf } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function ScanPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const fileInputRef = useRef(null);

  const saveToHistory = (scanResult) => {
    const existing = JSON.parse(localStorage.getItem('freshfind_history') || '[]');
    const newEntry = {
      id: Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString(),
      ...scanResult
    };
    localStorage.setItem('freshfind_history', JSON.stringify([newEntry, ...existing]));
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setHeatmap(null);
    setInsights(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.predict(file);
      const scanData = {
        item: data.category || 'Unknown Produce',
        verdict: data.freshness.toUpperCase(),
        confidence: data.confidence,
        imageUrl: preview
      };
      setResult(scanData);
      saveToHistory(scanData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!file) return;
    setLoadingHeatmap(true);
    try {
      const data = await apiService.explainPrediction(file);
      setHeatmap(data.explanation_image);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  const handleInsights = async () => {
    if (!result) return;
    setLoadingInsights(true);
    try {
      const data = await apiService.getInsights(result.verdict, result.item);
      setInsights(data.insights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900">New Scan</h1>
        <p className="text-gray-500 mt-1">Upload a photo to predict freshness using FreshFind's AI.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full max-w-2xl">
          <div className="card border-t-4 border-t-sage-500">
            <h2 className="font-display font-semibold text-xl text-navy-900 mb-6">Document Upload</h2>
            
            {!preview ? (
              <div 
                className={`border-2 border-dashed ${error ? 'border-red-400 bg-red-50' : 'border-cream-300 bg-cream-50 hover:bg-cream-100'} rounded-2xl transition-colors cursor-pointer flex flex-col items-center justify-center p-12 text-center group min-h-[300px]`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className={`w-8 h-8 ${error ? 'text-red-500' : 'text-sage-500'}`} />
                </div>
                <p className="font-medium text-navy-900">Drag & drop your photo here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <div className="mt-6 flex gap-2 justify-center">
                   <span className="px-3 py-1 bg-white border border-cream-200 rounded-lg text-xs font-medium text-gray-500 shadow-sm">Max 10 MB</span>
                   <span className="px-3 py-1 bg-white border border-cream-200 rounded-lg text-xs font-medium text-gray-500 shadow-sm">JPG, PNG</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-cream-200 min-h-[300px] flex items-center justify-center bg-gray-50 group">
                <div className="relative w-full h-full flex justify-center">
                  <img src={preview} alt="Preview" className="max-h-[400px] object-contain transition-opacity duration-300" />
                  {heatmap && (
                    <img src={heatmap} alt="Heatmap" className="absolute top-0 left-1/2 -translate-x-1/2 max-h-[400px] object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
                {heatmap && (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-900/80 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
                     Hover to see AI focus (Grad-CAM)
                   </div>
                )}
                {!loading && !result && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={clearFile} className="bg-white/90 p-2 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleFileChange}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
               <button 
                onClick={handlePredict}
                disabled={!file || loading || !!result}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Predict Freshness'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="flex-1 w-full max-w-md lg:sticky lg:top-8">
          <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-float min-h-[300px]">
            <h2 className="text-xl font-display font-semibold mb-6">AI Verdict</h2>
            
            {!result && !loading ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-400 opacity-50 text-center">
                <Leaf className="w-12 h-12 mb-3" />
                <p>Upload a document to see extracted data and freshness classification.</p>
              </div>
            ) : loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-navy-700 rounded w-1/3"></div>
                <div className="h-10 bg-navy-700 rounded w-1/2"></div>
                <div className="h-4 bg-navy-700 rounded w-3/4"></div>
                <div className="h-4 bg-navy-700 rounded w-2/3"></div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">Identified Produce</p>
                  <p className="text-2xl font-display font-bold">{result.item}</p>
                </div>
                
                <div className="p-4 rounded-xl border flex justify-between items-center bg-navy-800 border-navy-700">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    {result.verdict === 'FRESH' ? (
                      <span className="inline-flex items-center text-sage-400 font-bold text-lg">
                        <div className="w-2 h-2 rounded-full bg-sage-400 mr-2"></div>
                        FRESH
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-400 font-bold text-lg">
                        <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                        ROTTEN
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                     <p className="text-sm text-gray-400 mb-1">Confidence</p>
                     <p className="text-xl font-bold font-display">{result.confidence}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  {!heatmap && (
                    <button onClick={handleExplain} disabled={loadingHeatmap} className="btn-secondary w-full text-sm py-2">
                      {loadingHeatmap ? 'Generating Heatmap...' : 'Explain Prediction (Grad-CAM)'}
                    </button>
                  )}
                  
                  {!insights && (
                    <button onClick={handleInsights} disabled={loadingInsights} className="bg-sage-600 hover:bg-sage-700 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center">
                      {loadingInsights ? 'Generating Insights...' : 'FreshFind AI Insight'}
                    </button>
                  )}
                </div>

                {insights && (
                  <div className="mt-4 p-4 bg-navy-800 rounded-xl border border-navy-700 text-sm text-gray-300">
                    <p className="font-semibold text-sage-400 mb-2">AI Storage Guidance</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{insights}</p>
                    <p className="text-xs text-gray-500 mt-2">*This is general AI guidance, not an exact scientific measurement.</p>
                  </div>
                )}

                <button onClick={clearFile} className="w-full btn-secondary mt-6 !bg-navy-800 !text-white !border-navy-700 hover:!bg-navy-700">
                  Scan Another Item
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
