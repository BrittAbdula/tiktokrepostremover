import { useState, useEffect, useRef } from 'react';

const AVG_SECONDS_PER_VIDEO = 3; // Average delay + click time
const MANUAL_SECONDS_PER_VIDEO = 10; // Estimated seconds per video for manual deletion

const TimeEstimatorSection = () => {
  const [count, setCount] = useState<number | ''>('');
  const [estimatedTime, setEstimatedTime] = useState('—');
  const [manualEstimatedTime, setManualEstimatedTime] = useState('—'); // New state for manual estimation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate time estimation with debounce
  useEffect(() => {
    if (count === '' || count <= 0) {
      setEstimatedTime('—');
      setManualEstimatedTime('—');
      return;
    }
    
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Set new timer for calculation (500ms debounce)
    timerRef.current = setTimeout(() => {
      // Extension time
      const totalSeconds = Math.ceil(count * AVG_SECONDS_PER_VIDEO);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setEstimatedTime(`${minutes} min ${seconds} sec`);
      
      // Manual time
      const manualTotalSeconds = Math.ceil(count * MANUAL_SECONDS_PER_VIDEO);
      const manualMinutes = Math.floor(manualTotalSeconds / 60);
      const manualSeconds = manualTotalSeconds % 60;
      setManualEstimatedTime(`${manualMinutes} min ${manualSeconds} sec`);
      
      // Record count to DB after calculation
      recordCountToDB(count);
    }, 500);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [count]);

  // Record count to D1 database
  const recordCountToDB = async (count: number) => {
    try {
      await fetch('https://api.tiktokrepostremover.com/record-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
    } catch (error) {
      console.error('Error recording count:', error);
    }
  };

  return (
    <section 
      id="calculator" 
      className="space-y-4 max-w-lg mx-auto p-6 rounded-xl bg-gray-800/80 backdrop-blur-sm
                shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30"
    >
      <h2 className="text-2xl font-bold text-white text-center">⏱️ Delete All Reposts TikTok – Time Estimator</h2>
      <p className="text-gray-300 text-center">
        Wondering how long our <strong className="text-blue-300">TikTok repost remover extension</strong> will take? 
      </p>

      <div className="space-y-4">
        <label htmlFor="calc-input" className="block text-white text-center">
          <strong>Number of reposts to remove:</strong>
        </label>
        <div className="flex justify-center">
          <input
            id="calc-input"
            type="number"
            min="1"
            placeholder="e.g. 250"
            value={count}
            onChange={(e) => setCount(e.target.value ? parseInt(e.target.value) : '')}
            className="p-3 rounded-lg bg-gray-900 text-white border border-gray-700 w-full max-w-xs
                      focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-blue-300 font-bold mb-2">With Extension</h3>
            <div className="text-2xl font-bold text-white">{estimatedTime}</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30">
            <h3 className="text-gray-300 font-bold mb-2">Manual Deletion</h3>
            <div className="text-2xl font-bold text-white">{manualEstimatedTime}</div>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-sm text-center mt-6">
        Extension estimate: ~3 seconds per video<br />
        Manual estimate: ~10 seconds per video<br />
        Actual speed may vary with internet connection and TikTok rate limits.
      </p>
    </section>
  );
};

export default TimeEstimatorSection; 