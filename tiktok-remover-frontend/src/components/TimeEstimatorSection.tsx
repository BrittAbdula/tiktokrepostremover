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
      className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900
                shadow-xl shadow-[#FE2C55]/20 border border-gray-800 relative overflow-hidden"
    >
      {/* 科技感背景线条 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/10 to-[#00F2EA]/10"></div>
        {/* 网格线条 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(254, 44, 85, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(0, 242, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        {/* 动态线条 */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FE2C55] to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00F2EA] to-transparent animate-pulse delay-1000"></div>
        <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#FE2C55] to-transparent animate-pulse delay-500"></div>
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#00F2EA] to-transparent animate-pulse delay-1500"></div>
        {/* 角落装饰 */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#FE2C55] opacity-60"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#00F2EA] opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#00F2EA] opacity-60"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#FE2C55] opacity-60"></div>
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ⏱️ ClearTok Time Estimator
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Wondering how long our <strong className="text-[#FE2C55]">TikTok repost remover extension</strong> will take? 
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* 输入区域 */}
          <div className="lg:col-span-1 space-y-4">
            <label htmlFor="calc-input" className="block text-white text-center lg:text-left font-semibold">
              Number of reposts to remove:
            </label>
            <div className="relative">
              <input
                id="calc-input"
                type="number"
                min="1"
                placeholder="e.g. 250"
                value={count}
                onChange={(e) => setCount(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full p-4 rounded-lg bg-gray-900/50 text-white border border-gray-700 text-lg
                          focus:ring-2 focus:ring-[#FE2C55] focus:border-[#FE2C55] focus:outline-none backdrop-blur-sm
                          placeholder-gray-400 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-lg border border-[#FE2C55]/20 pointer-events-none"></div>
            </div>
          </div>
          
          {/* 结果显示区域 */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-[#FE2C55]/20 to-[#FF0050]/20 p-6 rounded-xl border border-[#FE2C55]/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FE2C55] to-[#FF0050]"></div>
              <h3 className="text-[#FE2C55] font-bold mb-3 text-lg">🚀 With ClearTok</h3>
              <div className="text-3xl font-bold text-white mb-2">{estimatedTime}</div>
              <p className="text-gray-300 text-sm">Lightning fast automation</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-600 to-gray-500"></div>
              <h3 className="text-gray-300 font-bold mb-3 text-lg">👆 Manual Deletion</h3>
              <div className="text-3xl font-bold text-white mb-2">{manualEstimatedTime}</div>
              <p className="text-gray-400 text-sm">One by one clicking</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-[#FE2C55] rounded-full"></span>
              <span>Extension: ~3 sec/video</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              <span>Manual: ~10 sec/video</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-[#00F2EA] rounded-full"></span>
              <span>Rate limit protected</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            Actual speed may vary with internet connection and TikTok rate limits.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimeEstimatorSection; 