import React, { useState, useEffect } from 'react';
import { Download, Search, ChevronRight, Inbox, X, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/apiService';

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, FRESH, ROTTEN
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const { addToast } = useToast();

  const fetchHistory = async () => {
    try {
      const data = await apiService.getHistory();
      setHistoryData(data);
    } catch (err) {
      addToast(err.message || 'Failed to load history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await apiService.deleteHistory(id);
      addToast('Record deleted successfully');
      fetchHistory();
    } catch (err) {
      addToast('Failed to delete record');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all history?')) return;
    try {
      await apiService.deleteAllHistory();
      addToast('All records deleted successfully');
      fetchHistory();
    } catch (err) {
      addToast('Failed to delete all records');
    }
  };

  const filteredData = historyData.filter(row => {
    const matchesFilter = filter === 'ALL' || row.verdict === filter;
    const matchesSearch = (row.item || '').toLowerCase().includes(searchTerm.toLowerCase()) || row.short_id?.includes(searchTerm) || row.id?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    if (historyData.length === 0) return;
    const headers = ['ID,Date,Item,Verdict,Confidence\n'];
    const csvContent = headers + historyData.map(r => `${r.short_id || r.id},${r.date},${r.item},${r.verdict},${r.confidence}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'freshfind_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('History exported successfully');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Prediction History</h1>
          <p className="text-gray-500 mt-1">{historyData.length} scans recorded locally.</p>
        </div>
        <div className="flex gap-2">
          {historyData.length > 0 && (
            <>
              <button onClick={exportCSV} className="btn-secondary whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
              <button onClick={handleDeleteAll} className="btn-secondary whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Delete All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-cream-100 flex flex-col sm:flex-row gap-4 bg-cream-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by produce type or scan ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 bg-white disabled:opacity-50"
              disabled={historyData.length === 0}
            />
          </div>
          
          <div className="flex space-x-2">
            {['ALL', 'FRESH', 'ROTTEN'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                disabled={historyData.length === 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${filter === f ? 'bg-navy-900 text-white' : 'bg-white border border-cream-200 text-gray-600 hover:bg-cream-50'}`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {historyData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <div className="bg-cream-100 p-4 rounded-full mb-4">
              <Inbox className="w-8 h-8 text-cream-500" />
            </div>
            <h3 className="font-semibold text-navy-900 text-lg mb-1">No Scans Yet</h3>
            <p className="max-w-sm">You haven't scanned any produce yet. Head over to New Scan to test the AI.</p>
          </div>
        ) : filteredData.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <h3 className="font-semibold text-navy-900 text-lg mb-1">No Results Found</h3>
            <p className="max-w-sm">No scans match your current search and filter criteria.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative">
             {selectedScan && (
               <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6 animate-in fade-in">
                  <div className="bg-white border border-cream-200 rounded-2xl shadow-float w-full max-w-md overflow-hidden">
                     <div className="p-4 border-b border-cream-100 flex justify-between items-center bg-cream-50">
                        <h3 className="font-display font-semibold text-lg text-navy-900">Scan Details #{selectedScan.short_id || selectedScan.id}</h3>
                        <button onClick={() => setSelectedScan(null)} className="text-gray-400 hover:text-navy-900"><X className="w-5 h-5"/></button>
                     </div>
                     <div className="p-6 space-y-6">
                        <div className="w-full h-48 bg-cream-100 rounded-xl overflow-hidden flex items-center justify-center">
                          {selectedScan.image ? (
                             <img src={`data:image/jpeg;base64,${selectedScan.image}`} className="w-full h-full object-cover" alt="Scan"/>
                          ) : (
                            <span className="text-4xl">🥗</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Produce</p>
                              <p className="font-medium text-navy-900">{selectedScan.item}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Date</p>
                              <p className="font-medium text-navy-900">{selectedScan.date}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Verdict</p>
                              {selectedScan.verdict === 'FRESH' ? (
                                <span className="text-sage-600 font-bold">FRESH</span>
                              ) : (
                                <span className="text-red-600 font-bold">ROTTEN</span>
                              )}
                           </div>
                           <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Confidence</p>
                              <p className="font-medium text-navy-900">{selectedScan.confidence}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-50 text-xs uppercase tracking-wider text-gray-500 border-b border-cream-100">
                  <th className="p-4 font-semibold">Item</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Verdict</th>
                  <th className="p-4 font-semibold text-right">Confidence</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredData.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedScan(row)} className="hover:bg-cream-50/50 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cream-100 overflow-hidden flex items-center justify-center">
                          {row.image ? (
                             <img src={`data:image/jpeg;base64,${row.image}`} className="w-full h-full object-cover" alt="Thumb"/>
                          ) : (
                            <span className="text-xl">🥗</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{row.item}</p>
                          <p className="text-xs text-gray-400">Scan #{row.short_id || row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{row.date}</td>
                    <td className="p-4">
                      {row.verdict === 'FRESH' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sage-100 text-sage-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-sage-500 mr-1.5"></div>
                          FRESH
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></div>
                          ROTTEN
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-display font-bold text-navy-900">{row.confidence}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleDelete(row.id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sage-500 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
