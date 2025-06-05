import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

const ScreenshotsSection = () => {
  const screenshots = [
    {
      url: "/images/oneclick.png",
      title: "One Click. Zero Reposts.",
      description: "One-click bulk removal of all reposted videos."
    },
    {
      url: "/images/threesteps.png",
      title: "Three Steps to Clean",
      description: "Watch your TikTok cleanup in action"
    },
    {
      url: "/images/justclean.png",
      title: "Just Clean",
      description: "Export deleted URLs and run in background"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动切换逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
    }, 4000); // 每4秒切换一次

    return () => clearInterval(interval);
  }, [screenshots.length]);

  const getCardScale = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    if (distance === 0) return "scale-100 z-20";
    if (distance === 1) return "scale-90 z-10";
    return "scale-75 z-0";
  };

  const getCardOpacity = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    if (distance === 0) return "opacity-100";
    if (distance === 1) return "opacity-60";
    return "opacity-30";
  };

  const getCardPosition = (index: number) => {
    const diff = index - currentIndex;
    if (diff === 0) return "translate-x-0";
    if (diff === 1 || (diff === -(screenshots.length - 1))) return "translate-x-[70%]";
    if (diff === -1 || (diff === screenshots.length - 1)) return "translate-x-[-70%]";
    if (diff > 1) return "translate-x-[140%]";
    return "translate-x-[-140%]";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            See ClearTok in Action
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Take a look at ClearTok's powerful TikTok repost remover interface and features
          </p>
        </div>
        
        {/* 轮播容器 */}
        <div className="relative h-[320px] sm:h-[400px] lg:h-[480px] mb-12 overflow-hidden">
          <div className="flex items-center justify-center h-full relative">
            {screenshots.map((screenshot, index) => (
              <Card 
                key={index}
                className={`
                  absolute w-72 sm:w-80 lg:w-96 transition-all duration-700 ease-in-out cursor-pointer
                  bg-gray-900/50 border-gray-700 hover:border-[#FE2C55]/50 
                  hover:shadow-xl hover:shadow-[#FE2C55]/20 backdrop-blur-sm overflow-hidden
                  ${getCardScale(index)} ${getCardOpacity(index)} ${getCardPosition(index)}
                `}
                style={{ aspectRatio: '1280/800' }}
                onClick={() => setCurrentIndex(index)}
              >
                <CardContent className="p-0 h-full">
                  <div className="relative h-full overflow-hidden">
                    <img 
                      src={screenshot.url}
                      alt={screenshot.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* <h3 className="text-white font-semibold text-lg mb-1">
                        {screenshot.title}
                      </h3> */}
                      <p className="text-gray-300 text-sm">
                        {screenshot.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 指示器 */}
        <div className="flex justify-center space-x-2 mb-8">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300 
                ${index === currentIndex 
                  ? "bg-[#FE2C55] scale-125" 
                  : "bg-gray-600 hover:bg-gray-500"
                }
              `}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            ✨ All features work seamlessly within your Chrome browser
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#FE2C55] rounded-full"></span>
              <span>Background Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#00F2EA] rounded-full"></span>
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Export Capability</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScreenshotsSection; 