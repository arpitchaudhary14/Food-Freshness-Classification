import React, { useState } from 'react';
import { Apple, ThermometerSnowflake, Droplets, Info, Search, ChevronDown, ChevronUp, Bot, Sparkles, Loader2 } from 'lucide-react';

const guideData = [
  {
    id: 1,
    title: 'Apples',
    category: 'Fruits',
    icon: <Apple className="w-5 h-5 text-red-500" />,
    advice: 'Store in the crisper drawer to maintain crispness and prevent mold. Keep away from ethylene-sensitive produce.',
  },
  {
    id: 2,
    title: 'Bananas',
    category: 'Fruits',
    icon: <Apple className="w-5 h-5 text-yellow-500" />,
    advice: 'Keep at room temperature until ripe. Do not refrigerate, as it stops the ripening process and turns the skin black.',
  },
  {
    id: 3,
    title: 'Leafy Greens',
    category: 'Vegetables',
    icon: <Droplets className="w-5 h-5 text-sage-500" />,
    advice: 'Wrap in paper towels to absorb excess moisture before refrigerating. Store in a sealed container or bag.',
  },
  {
    id: 4,
    title: 'Tomatoes',
    category: 'Vegetables',
    icon: <ThermometerSnowflake className="w-5 h-5 text-red-600" />,
    advice: 'Store at room temperature away from direct sunlight. Refrigeration alters their flavor and makes them mealy.',
  },
  {
    id: 5,
    title: 'Berries',
    category: 'Fruits',
    icon: <Droplets className="w-5 h-5 text-purple-500" />,
    advice: 'Do not wash until right before eating. Moisture encourages mold. Store in the fridge in a breathable container.',
  },
  {
    id: 6,
    title: 'Potatoes & Onions',
    category: 'Vegetables',
    icon: <ThermometerSnowflake className="w-5 h-5 text-yellow-700" />,
    advice: 'Store in a cool, dark, dry place. Do not store them together; onions produce gases that cause potatoes to sprout.',
  },
  {
    id: 7,
    title: 'Avocados',
    category: 'Fruits',
    icon: <Apple className="w-5 h-5 text-green-600" />,
    advice: 'Leave on the counter to ripen. Once soft and yielding, move to the fridge to pause the ripening process.',
  },
  {
    id: 8,
    title: 'Carrots',
    category: 'Vegetables',
    icon: <Droplets className="w-5 h-5 text-orange-500" />,
    advice: 'Cut off the green tops before storing. Keep in a sealed bag or container in the crisper drawer with a damp paper towel.',
  },
  {
    id: 9,
    title: 'Citrus (Oranges, Lemons)',
    category: 'Fruits',
    icon: <Apple className="w-5 h-5 text-yellow-400" />,
    advice: 'Can be stored on the counter for about a week, but last much longer (up to a month) loose in the refrigerator crisper.',
  },
  {
    id: 10,
    title: 'Cucumbers',
    category: 'Vegetables',
    icon: <ThermometerSnowflake className="w-5 h-5 text-green-500" />,
    advice: 'Store in the warmest part of the fridge (usually the front or door) wrapped in a paper towel inside a loose bag.',
  },
  {
    id: 11,
    title: 'Leftover Pizza',
    category: 'Fast Food',
    icon: <ThermometerSnowflake className="w-5 h-5 text-red-500" />,
    advice: 'Refrigerate within 2 hours wrapped in foil or an airtight container. Stays fresh for 3-4 days in fridge, or up to 2 months frozen. Reheat to 165°F.',
  },
  {
    id: 12,
    title: 'Burgers & Sandwiches',
    category: 'Fast Food',
    icon: <ThermometerSnowflake className="w-5 h-5 text-amber-600" />,
    advice: 'Store cooked patties and burgers in airtight containers at or below 40°F (4°C). Consume within 3 days. Keep wet sauces separate if prepping in advance.',
  },
  {
    id: 13,
    title: 'French Fries',
    category: 'Fast Food',
    icon: <Droplets className="w-5 h-5 text-yellow-500" />,
    advice: 'Cool completely, line container with paper towels to absorb oil, and seal tightly. Keep refrigerated for up to 3 days. Reheat in an oven or air fryer.',
  }
];

export default function GuidePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const filteredGuides = guideData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setAiResult(null); // Reset AI result on new search
  };

  const askAI = async () => {
    if (!searchTerm) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/guide/ask?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("Failed to fetch advice");
      const data = await response.json();
      setAiResult(data.advice);
    } catch (error) {
      setAiResult("Sorry, AI guidance is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-[80vh]">
      <div>
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-2">Interactive Food Guide</h1>
        <p className="text-gray-500 text-lg">Search for fruits, vegetables, or fast foods to get instant storage advice.</p>
      </div>

      <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex items-start space-x-4 shadow-sm">
        <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Tip:</strong> This interactive guide helps you quickly lookup standard handling procedures to keep your groceries and meals fresh longer! If you don't see it here, you can ask FreshFind AI!
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for apples, pizza, burgers, greens..." 
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-cream-200 focus:outline-none focus:ring-4 focus:ring-sage-500/20 focus:border-sage-500 bg-white text-lg shadow-soft transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredGuides.length > 0 ? (
          <>
            {filteredGuides.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${expandedId === item.id ? 'border-sage-400 shadow-md ring-2 ring-sage-500/10' : 'border-cream-200 shadow-sm hover:border-sage-300'}`}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="p-5 flex items-center justify-between bg-white z-10 relative">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-cream-50 rounded-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-xl">{item.title}</h3>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  <div>
                    {expandedId === item.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className={`transition-all duration-300 ease-in-out ${expandedId === item.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 pt-0 border-t border-cream-50 bg-cream-50/30">
                    <p className="text-gray-600 mt-4 leading-relaxed text-lg">
                      {item.advice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {searchTerm && (
              <div className="mt-8 pt-6 border-t border-cream-200 text-center">
                <p className="text-gray-500 mb-3">Didn't find exactly what you were looking for?</p>
                <button 
                  onClick={askAI}
                  disabled={aiLoading}
                  className="btn-primary space-x-2 bg-indigo-500 hover:bg-indigo-600 focus-visible:outline-indigo-500 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>Ask AI for "{searchTerm}"</span>
                </button>
              </div>
            )}
            
            {aiResult && (
              <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-indigo-100 p-2 rounded-xl">
                    <Bot className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-xl flex-1">AI Guidance for "{searchTerm}"</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg pl-14">
                  {aiResult}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            {!aiResult && !aiLoading && (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">No local results found</h3>
                <p className="text-gray-500 mb-6">We don't have "{searchTerm}" in our standard guide.</p>
                <button 
                  onClick={askAI}
                  className="btn-primary space-x-2 bg-indigo-500 hover:bg-indigo-600 focus-visible:outline-indigo-500 text-white text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Generate AI Storage Advice</span>
                </button>
              </>
            )}
            
            {aiLoading && (
              <div className="py-12 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-900 font-medium animate-pulse">Consulting Food Safety AI...</p>
              </div>
            )}
            
            {aiResult && (
              <div className="text-left bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-8 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-xl shadow-inner">
                    <Bot className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-2xl flex-1 capitalize">{searchTerm}</h3>
                </div>
                <div className="pl-16">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {aiResult}
                  </p>
                  <button onClick={() => {setSearchTerm(''); setAiResult(null);}} className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    &larr; Back to Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
