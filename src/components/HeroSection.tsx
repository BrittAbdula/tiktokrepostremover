import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// 引入 Font Awesome 6 的 Chrome 图标
import { FaChrome } from "react-icons/fa6";

const HeroSection = () => {
  return (
    <section className="text-center py-20 bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/10 to-[#00F2EA]/10"></div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Badge variant="secondary" className="mb-4 bg-[#FE2C55] text-white border-none">
          Free Chrome Extension
        </Badge>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          TikTok Repost Remover Extension
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          <strong className="text-[#FE2C55]">Delete every reposted TikTok video in one click.</strong><br />
          Clean up your profile, fix accidental shares, and keep your brand on point.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white font-bold shadow-lg hover:shadow-xl transition-all" 
            asChild
          >
            <a href="#download" className="flex items-center justify-center "> {/* 确保链接内部的flex布局应用到图标和文本 */}
              {/* 渲染引入的 Font Awesome Chrome 图标 */}
              <FaChrome className="w-5 h-5 mr-2 text-white" />
              Get the Free Chrome Extension
            </a>
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Works on TikTok.com • Secure • No password stored
        </p>
      </div>
    </section>
  );
};

export default HeroSection;