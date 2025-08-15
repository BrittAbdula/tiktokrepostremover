import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// 引入 Font Awesome 6 图标组件
import {
  FaTrashCan,      // 用于"Remove All Reposts" (删除)
  FaClock,         // 用于"Smart Human-Delay" (时钟，表示延迟)
  FaGithub,        // 用于"Open-Source Transparency" (GitHub图标)
  FaLock,          // 用于"100% Local" (锁，表示隐私/本地)
  FaGift,          // 用于"Free Forever" (礼物，表示免费)
  FaShieldHalved,  // 用于"Rate Limit Protection" (盾牌，表示保护)
  FaWindowMinimize, // 用于"Background Operation" (后台运行)
  FaDownload,      // 用于"Export URLs" (导出)
  FaEye            // 用于"Real-time Monitoring" (实时监控)
} from "react-icons/fa6"; 

const FeaturesSection = () => {
  const features = [
    {
      title: "TikTok All Repost Remover",
      description: "Bulk deletion saves hours of manual tapping",
      badge: "Core",
      // 直接引用图标组件
      icon: FaTrashCan
    },
    {
      title: "Background Operation",
      description: "Continue working while ClearTok removes reposts in the background",
      badge: "Multitask",
      icon: FaWindowMinimize
    },
    {
      title: "Export Deleted URLs",
      description: "Download a complete list of all removed video URLs for your records",
      badge: "Backup",
      icon: FaDownload
    },
    {
      title: "Real-time Monitoring",
      description: "Watch removals in real time with detailed progress and stats",
      badge: "Live",
      icon: FaEye
    },
    {
      title: "Smart Human-Delay",
      description: "Removes reposts at human-like speed to avoid flags and stay safe", 
      badge: "Safe",
      icon: FaClock
    },
    {
      title: "Open-Source Transparency",
      description: "Review the code and privacy approach — ClearTok is open-source on GitHub",
      badge: "Transparent",
      icon: FaGithub
    },
    {
      title: "100% Local",
      description: "ClearTok keeps all data in your browser; we never ask for your TikTok password or credentials",
      badge: "Private",
      icon: FaLock
    },
    {
      title: "Free TikTok All Repost Remover",
      description: "No hidden upgrade wall",
      badge: "Free",
      icon: FaGift
    },
    {
      title: "Rate Limit Protection",
      description: "Built-in throttling respects TikTok's limits for account safety",
      badge: "Protected",
      icon: FaShieldHalved
    }
  ];

  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Key Features
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Everything you need to bulk-remove reposts — fast and safely
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-xl hover:shadow-[#FE2C55]/20 transition-all duration-300 bg-gray-900 border-gray-800 hover:border-[#FE2C55]/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full flex items-center justify-center">
                  {/* 渲染引入的图标组件 */}
                  {/* Font Awesome 图标默认是 SVG，可以直接通过 className 控制大小和颜色 */}
                  {feature.icon && (
                    <feature.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <Badge variant="outline" className="border-[#FE2C55] text-[#FE2C55]">{feature.badge}</Badge>
              </div>
              <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;