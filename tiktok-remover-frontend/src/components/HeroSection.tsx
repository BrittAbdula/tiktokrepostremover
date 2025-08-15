import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
// 引入 Font Awesome 6 的 Chrome 和 Edge 图标
import { FaChrome, FaEdge, FaStar, FaStarHalfStroke } from "react-icons/fa6";
import RecentDeletionsScroll from "./RecentDeletionsScroll";
import WaitListSection from "./WaitListSection";

const HeroSection = () => {
  const [browser, setBrowser] = useState<'chrome' | 'edge' | 'other'>('other');

  useEffect(() => {
    // Client-side only
    try {
      const ua = navigator.userAgent || '';
      // Detect Edge first (UA contains "Edg" on Chromium Edge)
      if (/Edg/i.test(ua)) {
        setBrowser('edge');
        return;
      }
      // Detect Chrome (exclude Opera, Edge, Samsung Browser)
      if (/(Chrome|CriOS)/i.test(ua) && !/(OPR|Opera|Edg|SamsungBrowser)/i.test(ua)) {
        setBrowser('chrome');
        return;
      }
      setBrowser('other');
    } catch {
      setBrowser('other');
    }
  }, []);

  const showChrome = browser === 'chrome' || browser === 'other';
  const showEdge = browser === 'edge' || browser === 'other';

  return (
    <section id="hero" className="text-center py-16 md:py-20 bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#FE2C55]/10 to-[#00F2EA]/10"></div>
      <RecentDeletionsScroll />
      <div className="absolute inset-0 hidden md:block pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#FE2C55] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#00F2EA] rounded-full animate-bounce delay-150"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-[#FE2C55] rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-20 right-32 w-2 h-2 bg-[#00F2EA] rounded-full animate-pulse delay-500"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-20">
        <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white border-none
                                           shadow-lg animate-pulse">
          Free Browser Extension
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          TikTok Repost Remover - Delete All Reposts on TikTok in One Click
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          <strong className="text-[#FE2C55]">ClearTok — The Ultimate TikTok All Repost Remover Extension</strong>
        </p>
        <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Delete your reposted videos in seconds. Clean your profile, undo mistakes, and keep your feed on brand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
          {showChrome && (
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                       text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 transition-all duration-300
                       transform hover:scale-105"
              asChild
            >
              <a
                href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
                className="flex items-center justify-center w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* 渲染引入的 Font Awesome Chrome 图标 */}
                <FaChrome className="w-5 h-5 mr-2 text-white" />
                Add ClearTok to Chrome
              </a>
            </Button>
          )}
          {showEdge && (
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4 bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#0078D4] 
                       text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#0078D4]/50 transition-all duration-300
                       transform hover:scale-105"
              asChild
            >
              <a
                href="https://microsoftedge.microsoft.com/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc"
                className="flex items-center justify-center w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* 渲染引入的 Font Awesome Edge 图标 */}
                <FaEdge className="w-5 h-5 mr-2 text-white" />
                Add ClearTok to Edge
              </a>
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Free • Works on TikTok.com • Secure • No password required
        </p>

        {/* Rating area: mobile = two lines; desktop = single row */}
        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3 text-gray-300">
          {/* Stars line */}
          <div className="flex items-center">
            <FaStar className="w-5 h-5 text-emerald-500" />
            <FaStar className="w-5 h-5 text-emerald-500" />
            <FaStar className="w-5 h-5 text-emerald-500" />
            <FaStar className="w-5 h-5 text-emerald-500" />
            <FaStarHalfStroke className="w-5 h-5 text-emerald-500" />
          </div>

          {/* Text line */}
          <a
            href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white hover:underline"
          >
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">4.8</span>
            <span className="text-gray-300">(40+ reviews) on</span>
            <img alt="Web store" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" style={{color: 'transparent'}} src="/images/store.svg" />
            <span>Chrome store</span>
          </a>
        </div>
      </div>

      {/* Cross-browser availability link */}
      {browser === 'chrome' && (
        <p className="text-sm text-gray-300 mt-4 text-center relative z-20">
          Also available for{' '}
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:no-underline font-semibold"
          >
            Edge
          </a>
        </p>
      )}
      {browser === 'edge' && (
        <p className="text-sm text-gray-300 mt-4 text-center relative z-20">
          Also available for{' '}
          <a
            href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:no-underline font-semibold"
          >
            Chrome
          </a>
        </p>
      )}

      {/* WaitList Section */}
      <div className="mt-16">
        <WaitListSection />
      </div>
    </section>
  );
};

export default HeroSection;