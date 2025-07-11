import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DeletionRecord {
  id: string;
  username: string;
  count: number;
  duration: number;
  timeAgo: string;
}

const RecentDeletionsScroll = () => {
  const [records, setRecords] = useState<DeletionRecord[]>([]);

  const generateUsername = () =>  `User${Math.floor(1000 + Math.random() * 9000)}`;
  // Generate mock data for demonstration
  const generateMockData = (): DeletionRecord[] => {
    const usernames = Array.from({ length: 10 }, generateUsername);
    
    const timeOptions = ['3s ago', '12s ago', '28s ago', '45s ago', '1m ago', '2m ago', '3m ago', '5m ago'];
    
    return Array.from({ length: 30 }, (_, i) => {
      const count = Math.floor(Math.random() * 50) + 1;
      const durationMultiplier = Math.random() * 2 + 3; // 3-5秒的随机系数
      const duration = Math.round(count * durationMultiplier);
      
      return {
        id: `record-${i}`,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        count: count,
        duration: duration,
        timeAgo: timeOptions[Math.floor(Math.random() * timeOptions.length)]
      };
    });
  };

  useEffect(() => {
    // Initialize with mock data
    setRecords(generateMockData());
    
    // Update records periodically to simulate real-time activity
    const interval = setInterval(() => {
      setRecords(prev => {
        const newRecords = generateMockData();
        return [...newRecords.slice(0, 5), ...prev.slice(0, 25)];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <div className="relative w-full h-full">
        {/* Gradient overlay to fade out content */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
        
        {/* Scrolling container - faster animation */}
        <div 
          className="h-full flex flex-col justify-start pt-8"
          style={{
            animation: 'scrollUp 15s linear infinite'
          }}
        >
          <div className="space-y-3">
            {records.concat(records).map((record, index) => (
              <div
                key={`${record.id}-${index}`}
                className={cn(
                  "bg-black/20 backdrop-blur-sm border border-white/5 rounded-lg px-4 py-2 mx-4",
                  "text-sm whitespace-nowrap",
                  "shadow-lg opacity-80"
                )}
              >
                <div className="text-gray-300 flex items-center space-x-2">
                  <span className="text-[#FE2C55] font-medium">{record.timeAgo}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-white font-medium">{record.username}</span>
                  <span className="text-gray-400">deleted</span>
                  <span className="text-[#00F2EA] font-bold">{record.count}</span>
                  <span className="text-gray-400">reposts via</span>
                  <span className="text-white font-semibold">ClearTok</span>
                  <span className="text-gray-400">in</span>
                  <span className="text-[#FE2C55] font-medium">{record.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentDeletionsScroll; 