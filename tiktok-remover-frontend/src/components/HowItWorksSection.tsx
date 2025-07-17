import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// 引入 Font Awesome 6 图标组件
import {
  FaRightToBracket, // 用于"Sign In" (登录图标)
  FaPuzzlePiece,    // 用于"Open Extension" (扩展程序图标)
  FaGear            // 用于"Sit Back & Relax" (齿轮，表示自动化或工作进行中)
} from "react-icons/fa6"; 

const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Sign In to TikTok",
      description: "Sign in to TikTok.com on Chrome browser to prepare for using the repost remover extension",
      // 直接引用图标组件
      icon: FaRightToBracket 
    },
    {
      step: "2", 
      title: "Launch ClearTok",
      description: "Open the 'ClearTok' icon & click Start Removing to begin the cleanup process",
      icon: FaPuzzlePiece 
    },
    {
      step: "3",
      title: "Monitor Your All Repost Remover Progress",
      description: "Watch real-time progress as our TikTok all repost remover works safely in the background. Switch tabs to multitask and export deleted URLs when the repost remover tiktok process is complete",
      icon: FaGear 
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-900 rounded-2xl border border-gray-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Three simple steps to clean up your TikTok profile with advanced monitoring and export features
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="relative">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center">
                {/* 渲染引入的图标组件 */}
                {/* Font Awesome 图标默认是 SVG，可以直接通过 className 控制大小和颜色 */}
                {step.icon && (
                  <step.icon className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#00F2EA] to-[#25F4EE] rounded-full flex items-center justify-center text-sm font-bold text-black">
                {step.step}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-gray-300">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;