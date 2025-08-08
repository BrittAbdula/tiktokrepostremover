import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// 引入 Font Awesome 6 的 Chrome 和 Edge 图标
import { FaChrome, FaEdge } from "react-icons/fa6";
import RecentDeletionsScroll from "./RecentDeletionsScroll";

const HeroSection = () => {
  return (
    <section id="hero" className="text-center py-20 bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/10 to-[#00F2EA]/10"></div>
      {/* Recent Deletions Live Feed */}
      <RecentDeletionsScroll />
      {/* 添加动态背景粒子效果 */}
      <div className="absolute inset-0">
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
          TikTok Repost Remover - Delete All Repost on TikTok in One Click
        </h1>
        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          <strong className="text-[#FE2C55]">ClearTok - The Ultimate TikTok All Repost Remover Extension</strong>
        </p>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          The most powerful repost remover extension to delete all repost on TikTok instantly. Clean up your profile, remove accidental reposts, and maintain your authentic brand presence with our all reposts remover extension.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
          <Button
            size="lg"
            className="text-lg px-8 py-4 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 transition-all duration-300
                     transform hover:scale-105"
            asChild
          >
            <a
              href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
              className="flex items-center justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* 渲染引入的 Font Awesome Chrome 图标 */}
              <FaChrome className="w-5 h-5 mr-2 text-white" />
              Get ClearTok for Chrome
            </a>
          </Button>
          <Button
            size="lg"
            className="text-lg px-8 py-4 bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#0078D4] 
                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#0078D4]/50 transition-all duration-300
                     transform hover:scale-105"
            asChild
          >
            <a
              href="https://microsoftedge.microsoft.com/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc"
              className="flex items-center justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* 渲染引入的 Font Awesome Edge 图标 */}
              <FaEdge className="w-5 h-5 mr-2 text-white" />
              Get ClearTok for Edge
            </a>
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Works on TikTok.com • Secure • No password required
        </p>
      </div>
    </section>
  );
};

export default HeroSection;