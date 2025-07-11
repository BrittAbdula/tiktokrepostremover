import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaTrashCan,
  FaClock,
  FaLock,
  FaGift,
  FaShieldHalved,
  FaEye
} from "react-icons/fa6";

const TopFeaturesSection = () => {
  const topFeatures = [
    {
      title: "Remove All Reposts",
      description: "Bulk deletion saves hours of manual tapping",
      badge: "Core",
      icon: FaTrashCan
    },
    {
      title: "Smart Human-Delay",
      description: "Mimics natural browsing speed to avoid account flags", 
      badge: "Safe",
      icon: FaClock
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
    },
    {
      title: "Real-time Monitoring",
      description: "Watch the deletion process live with detailed progress updates",
      badge: "Live",
      icon: FaEye
    }
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Why Choose ClearTok?
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          The safest and most efficient way to clean up your TikTok profile
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-xl hover:shadow-[#FE2C55]/20 transition-all duration-300 bg-gray-900 border-gray-800 hover:border-[#FE2C55]/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full flex items-center justify-center">
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

export default TopFeaturesSection; 