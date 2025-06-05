import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// 引入 Font Awesome 6 图标组件
import {
  FaServer,      // 用于"Zero External Servers"
  FaCodeBranch,  // 用于"Open-Source MIT License" (通常表示代码分支或开源)
  FaXmark        // 用于"Easy Uninstall" (表示关闭、移除或取消)
} from "react-icons/fa6"; 

const SecuritySection = () => {
  const securityFeatures = [
    {
      title: "Zero External Servers",
      description: "No trackers, analytics, or data collection",
      // 直接引用图标组件
      icon: FaServer 
    },
    {
      title: "Open-Source MIT License",
      description: "Available on GitHub for community audit",
      icon: FaCodeBranch
    },
    {
      title: "Easy Uninstall",
      description: "Remove at any moment—your TikTok account remains intact",
      icon: FaXmark
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Security & Privacy First
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Our extension runs entirely in your browser session and uses TikTok's public web interface, 
            the same clicks you could do manually:
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="text-center bg-gray-900/50 border-gray-700 hover:border-[#FE2C55]/50 hover:shadow-xl hover:shadow-[#FE2C55]/20 transition-all duration-300 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full flex items-center justify-center shadow-lg">
                  {/* 渲染引入的图标组件 */}
                  {/* Font Awesome 图标默认是 SVG，可以直接通过 className 控制大小和颜色 */}
                  {feature.icon && (
                    <feature.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;