import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from 'react-icons/fa';

interface LazyVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  title?: string;
  description?: string;
}

const LazyVideoPlayer: React.FC<LazyVideoPlayerProps> = ({
  src,
  poster,
  className = "",
  autoPlay = false,
  muted = true,
  loop = true,
  title,
  description
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // 懒加载 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 视频事件处理
  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (autoPlay) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [autoPlay]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleError = useCallback(() => {
    setError('Video failed to load');
    setIsLoading(false);
  }, []);

  // 控制按钮操作
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && containerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
    }
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen().catch(console.error);
      }
    }
  }, []);

  // 控制栏显示/隐藏
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleTouchStart = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
    >
      {/* 标题和描述 */}
      {(title || description) && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent p-4">
          {title && <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>}
          {description && <p className="text-gray-300 text-sm">{description}</p>}
        </div>
      )}

      {/* 视频容器 */}
      <div className="relative aspect-video w-full">
        {!isInView ? (
          // 占位符
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaPlay className="text-white text-xl ml-1" />
              </div>
              <p className="text-gray-400">Click to load video</p>
            </div>
          </div>
        ) : (
          <>
            {/* 视频元素 */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              poster={poster}
              muted={isMuted}
              loop={loop}
              playsInline
              preload="metadata"
              onLoadedData={handleLoadedData}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onError={handleError}
              onClick={togglePlay}
            >
              <source src={src} type="video/mp4" />
              Your browser does not support video playback.
            </video>

            {/* 加载状态 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[#FE2C55] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </div>
            )}

            {/* 错误状态 */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <p className="text-red-400 mb-2">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* 播放/暂停按钮 (中央) */}
            {!isPlaying && !isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FE2C55] to-[#FF0050] 
                           hover:from-[#FF0050] hover:to-[#FE2C55] border-none shadow-2xl
                           transform hover:scale-110 transition-all duration-300"
                >
                  <FaPlay className="text-white text-2xl ml-1" />
                </Button>
              </div>
            )}

            {/* 控制栏 */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent 
                           transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* 进度条 */}
              <div className="px-4 pt-4">
                <div 
                  className="w-full h-2 bg-white/20 rounded-full cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full transition-all duration-150
                             group-hover:h-3 group-hover:-mt-0.5"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  {/* 播放/暂停 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/10 p-2"
                  >
                    {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg" />}
                  </Button>

                  {/* 音量 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/10 p-2"
                  >
                    {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                  </Button>

                  {/* 时间显示 */}
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* 全屏 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/10 p-2"
                  >
                    <FaExpand className="text-lg" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LazyVideoPlayer; 