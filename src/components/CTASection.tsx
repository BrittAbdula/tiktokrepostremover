import { Button } from "@/components/ui/button";
// 引入 Font Awesome 6 图标组件
import {
  FaChrome,         // 用于 Chrome 按钮图标
  FaShieldHalved,   // 用于 "100% Secure"
  FaGithub,         // 用于 "Open Source"
  FaLock            // 用于 "Privacy First" (替代 privacy.svg，更通用)
} from "react-icons/fa6";

const CTASection = () => {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-[#FE2C55] via-[#FF0050] to-[#00F2EA] rounded-2xl text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Clean Your TikTok?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of users who have already cleaned up their TikTok profiles
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all" 
            asChild
          >
            <a href="https://chromewebstore.google.com/detail/tiktok-all-reposted-video/amgpfdpibiacligkkkbeonfhmonkgjhg/reviews" className="flex items-center justify-center">
              {/* 渲染引入的 Font Awesome Chrome 图标 */}
              <FaChrome className="w-5 h-5 mr-2 text-black" /> {/* Chrome 按钮是白色背景，所以图标用黑色 */}
              Add to Chrome – It's Free
            </a>
          </Button>
        </div>
        <p className="text-sm opacity-80">
          No sign-up • Instant install • Works worldwide
        </p>
        <div className="flex justify-center items-center space-x-6 mt-8 text-sm opacity-80">
          <div className="flex items-center">
            {/* 渲染引入的 Font Awesome Shield 图标 */}
            <FaShieldHalved className="w-4 h-4 mr-2 text-white" /> {/* 背景是彩色渐变，文字是白色，图标也用白色 */}
            100% Secure
          </div>
          <div className="flex items-center">
            {/* 渲染引入的 Font Awesome GitHub 图标 */}
            <FaGithub className="w-4 h-4 mr-2 text-white" /> {/* 同上，图标用白色 */}
            Open Source
          </div>
          <div className="flex items-center">
            {/* 渲染引入的 Font Awesome Lock 图标 (替代 privacy.svg) */}
            <FaLock className="w-4 h-4 mr-2 text-white" /> {/* 同上，图标用白色 */}
            Privacy First
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;