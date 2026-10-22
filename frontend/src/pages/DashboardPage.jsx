import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, UploadCloud, Scan, Cpu, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, freshRate: 0, rottenRate: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const backendHistory = await apiService.getHistory();
        if (backendHistory && backendHistory.length > 0) {
          const freshCount = backendHistory.filter(d => d.verdict === 'FRESH').length;
          setStats({
            total: backendHistory.length,
            freshRate: Math.round((freshCount / backendHistory.length) * 100),
            rottenRate: Math.round(((backendHistory.length - freshCount) / backendHistory.length) * 100)
          });
          return;
        }
      } catch (e) {
        // Fallback to localStorage if offline or not logged in
      }

      const data = JSON.parse(localStorage.getItem('freshfind_history') || '[]');
      if (data.length > 0) {
        const freshCount = data.filter(d => d.verdict === 'FRESH').length;
        setStats({
          total: data.length,
          freshRate: Math.round((freshCount / data.length) * 100),
          rottenRate: Math.round(((data.length - freshCount) / data.length) * 100)
        });
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">AI-powered insights based on your scan history.</p>
      </div>

      {/* Dark Theme Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-float relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-navy-800 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Total Scans Recorded</p>
            <p className="text-3xl font-display font-bold mt-1">{stats.total}</p>
          </div>
        </div>

        <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-float relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sage-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-navy-800 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-sage-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Freshness Rate</p>
            <p className="text-3xl font-display font-bold mt-1 text-sage-400">{stats.freshRate}%</p>
          </div>
        </div>

        <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-float relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-navy-800 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Spoilage Rate</p>
            <p className="text-3xl font-display font-bold mt-1 text-red-400">{stats.rottenRate}%</p>
          </div>
        </div>
      </div>

      {/* AI Processing Pipeline */}
      <div className="bg-navy-900 rounded-2xl p-6 md:p-8 text-white">
        <h2 className="text-xl font-display font-semibold mb-6">AI Processing Pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
            <div className="text-cyan-400 mb-3"><UploadCloud className="w-6 h-6" /></div>
            <h3 className="font-semibold mb-1">Image Ingestion</h3>
            <p className="text-xs text-gray-400">High-res photo upload and format validation</p>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
            <div className="text-sage-400 mb-3"><Scan className="w-6 h-6" /></div>
            <h3 className="font-semibold mb-1">Preprocessing</h3>
            <p className="text-xs text-gray-400">Preparing image for AI analysis</p>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-5 relative overflow-hidden ring-1 ring-cyan-500/50">
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
            <div className="text-cyan-400 mb-3 relative z-10"><Cpu className="w-6 h-6" /></div>
            <h3 className="font-semibold mb-1 relative z-10">Inference Engine</h3>
            <p className="text-xs text-cyan-100/70 relative z-10">FreshFind's AI model analyzes the visual features</p>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-5">
            <div className="text-indigo-400 mb-3"><CheckCircle2 className="w-6 h-6" /></div>
            <h3 className="font-semibold mb-1">Verdict Output</h3>
            <p className="text-xs text-gray-400">Final Fresh/Rotten categorization and confidence scoring</p>
          </div>
        </div>
      </div>
    </div>
  );
}
