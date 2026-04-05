import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Moon, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [ip, setIp] = useState('');
  const [subnet, setSubnet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [copiedField, setCopiedField] = useState(null);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/calculate', {
        ip: ip,
        subnet: subnet
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isFormValid = ip.trim() !== '' && subnet.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-slate-300" />}
      </button>

      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Subnetting Tool
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Calculate your network easily. Enter an IP and a CIDR or mask.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8">
          <form onSubmit={handleCalculate} className="space-y-4">
            
            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                IP Address
              </label>
              <input
                id="ip"
                type="text"
                placeholder="e.g. 192.168.1.10"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="subnet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subnet Mask or CIDR
              </label>
              <input
                id="subnet"
                type="text"
                placeholder="e.g. 24 or 255.255.255.0"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                'Calculate'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start text-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 text-slate-800 dark:text-slate-200">
              Results
            </h2>
            <div className="space-y-4">
              
              <ResultRow 
                label="Network Address" 
                value={result.network_address} 
                fieldKey="network"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <ResultRow 
                label="Broadcast Address" 
                value={result.broadcast_address} 
                fieldKey="broadcast"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <ResultRow 
                label="Host Range" 
                value={`${result.first_host} - ${result.last_host}`} 
                fieldKey="range"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <ResultRow 
                label="Total Usable Hosts" 
                value={result.total_hosts} 
                fieldKey="hosts"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <ResultRow 
                label="Subnet Mask" 
                value={result.subnet_mask} 
                fieldKey="mask"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <ResultRow 
                label="CIDR Notation" 
                value={result.cidr} 
                fieldKey="cidr"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper component for result rows
function ResultRow({ label, value, fieldKey, copiedField, onCopy }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group">
      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <div className="flex items-center space-x-2 mt-1 sm:mt-0 font-mono text-slate-800 dark:text-slate-200">
        <span>{value}</span>
        <button 
          onClick={() => onCopy(value, fieldKey)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md focus:outline-none"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default App;
