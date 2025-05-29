import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// 引入 Font Awesome 6 图标组件
import {
  FaTrashCan,      // 用于“Remove All Reposts” (删除)
  FaClock,         // 用于“Smart Human-Delay” (时钟，表示延迟)
  FaGithub,        // 用于“Open-Source Transparency” (GitHub图标)
  FaLock,          // 用于“100% Local” (锁，表示隐私/本地)
  FaGift,          // 用于“Free Forever” (礼物，表示免费)
  FaShieldHalved   // 用于“Rate Limit Protection” (盾牌，表示保护)
} from "react-icons/fa6"; 

const FeaturesSection = () => {
  const features = [
    {
      title: "Remove All Reposts",
      description: "Bulk deletion saves hours of manual tapping",
      badge: "Time Saver",
      // 直接引用图标组件
      icon: FaTrashCan
    },
    {
      title: "Smart Human-Delay",
      description: "Mimics natural browsing speed to avoid account flags", 
      badge: "Safe",
      icon: FaClock
    },
    {
      title: "Open-Source Transparency",
      description: "Check the code, audit the privacy",
      badge: "Transparent",
      icon: FaGithub
    },
    {
      title: "100% Local",
      description: "Data never leaves your browser; we never ask for your TikTok password",
      badge: "Private",
      icon: FaLock
    },
    {
      title: "Free Forever",
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
          Everything you need to manage your TikTok reposts efficiently and safely
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                {/* 渲染引入的图标组件 */}
                {/* Font Awesome 图标默认是 SVG，可以直接通过 className 控制大小和颜色 */}
                {feature.icon && (
                  <feature.icon className="w-8 h-8 text-gray-900" />
                )}
                <Badge variant="outline">{feature.badge}</Badge>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;