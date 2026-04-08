import { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, Check, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [ip, setIp] = useState('');
  const [subnet, setSubnet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Enforce light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Basic Validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip.trim())) {
      setError("Invalid IP address format.");
      setLoading(false);
      return;
    }
    if (subnet.trim().match(/^\d+$/)) {
      if (parseInt(subnet.trim(), 10) > 32) {
        setError("CIDR prefix must be between 0 and 32.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/calculate', {
        ip: ip.trim(),
        subnet: subnet.trim()
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 transition-colors duration-300 w-full">

      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-5xl h-15 font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            Subnetting Tool
          </h1>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 sm:p-8 max-w-lg mx-auto">
          <form onSubmit={handleCalculate} className="space-y-5">

            <div>
              <label htmlFor="ip" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                IP Address
              </label>
              <input
                id="ip"
                type="text"
                placeholder="e.g. 192.168.1.10"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow font-mono"
              />
            </div>

            <div>
              <label htmlFor="subnet" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subnet Mask or CIDR
              </label>
              <input
                id="subnet"
                type="text"
                placeholder="e.g. 24 or 255.255.255.0"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                'Calculate Tool'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-5 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pt-6">

            {/* Card 1: Network Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-[5px] border-t-blue-500 border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                Network Info
              </h3>
              <div className="space-y-3">
                <ResultRow label="Network Address" value={result.network} fieldKey="network" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="Broadcast Address" value={result.broadcast} fieldKey="broadcast" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="First Host" value={result.first_host} fieldKey="first_host" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="Last Host" value={result.last_host} fieldKey="last_host" copiedField={copiedField} onCopy={copyToClipboard} />
              </div>
            </div>

            {/* Card 2: Host Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-[5px] border-t-green-500 border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                Host Info
              </h3>
              <div className="space-y-3">
                <ResultRow label="Total Hosts" value={result.total_hosts} fieldKey="total_hosts" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="Usable Hosts" value={result.usable_hosts} fieldKey="usable_hosts" copiedField={copiedField} onCopy={copyToClipboard} />
              </div>
            </div>

            {/* Card 3: IP Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-t-[5px] border-t-purple-500 border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                IP Info
              </h3>
              <div className="space-y-3">
                <ResultRow label="IP Class" value={result.ip_class} fieldKey="ip_class" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="IP Type" value={result.ip_type} fieldKey="ip_type" copiedField={copiedField} onCopy={copyToClipboard} />
                <ResultRow label="Binary IP" value={result.ip_binary} fieldKey="ip_binary" copiedField={copiedField} onCopy={copyToClipboard} />
              </div>
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
    <div className="flex flex-col py-1.5 px-0 rounded-lg group">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider">{label}</span>
      <div className="flex items-center justify-between font-mono text-sm text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
        <span className="truncate mr-3 font-medium text-[13px] sm:text-sm" title={value}>{value}</span>
        <button
          onClick={() => onCopy(value?.toString() || '', fieldKey)}
          className="p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 rounded-md focus:outline-none flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default App;
