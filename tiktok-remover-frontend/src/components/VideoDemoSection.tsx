import LazyVideoPlayer from './LazyVideoPlayer';

const VideoDemoSection = () => {
  return (
    <section id="demo-video" className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            See ClearTok in Action
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Watch our product demo to learn how to clean up your TikTok reposts in minutes.
            Simple, secure, and efficient one-click solution.
          </p>
        </div>

        {/* 视频播放器 */}
        <div className="mb-12">
          <LazyVideoPlayer
            src="/202506301452.mp4"
            autoPlay={false}
            muted={true}
            loop={true}
            className="shadow-2xl shadow-[#FE2C55]/20"
          />
        </div>

        {/* 视频特点介绍 */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Quick Install</h3>
            <p className="text-gray-300">
              Install the extension from Chrome Web Store in seconds with no complex setup required.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00F2EA] to-[#25F4EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-2xl">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Detection</h3>
            <p className="text-gray-300">
              Automatically identifies and batch selects all your reposted content with 99.9% accuracy.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">One-Click Clean</h3>
            <p className="text-gray-300">
              Delete all selected reposts with a single click, completely automated process.
            </p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-16 bg-gradient-to-r from-[#FE2C55]/10 to-[#00F2EA]/10 rounded-2xl p-8 border border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#FE2C55] mb-2">100K+</div>
              <div className="text-gray-300 text-sm">Users Trust</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#00F2EA] mb-2">5M+</div>
              <div className="text-gray-300 text-sm">Videos Cleaned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FE2C55] mb-2">99.9%</div>
              <div className="text-gray-300 text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#00F2EA] mb-2">30s</div>
              <div className="text-gray-300 text-sm">Average Clean Time</div>
            </div>
          </div>
        </div>

        {/* Mobile Notice */}
        <div className="mt-12 lg:hidden">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-black text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="text-amber-400 font-semibold mb-1">Mobile Notice</h4>
                <p className="text-amber-200 text-sm">
                  ClearTok currently supports desktop Chrome browser only. Please visit TikTok.com on your computer to use our extension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemoSection; 