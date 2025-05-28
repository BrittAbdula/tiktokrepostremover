
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const features = [
    {
      title: "Remove All Reposts",
      description: "Bulk deletion saves hours of manual tapping",
      badge: "Time Saver",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/delete.svg"
    },
    {
      title: "Smart Human-Delay",
      description: "Mimics natural browsing speed to avoid account flags", 
      badge: "Safe",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/timer.svg"
    },
    {
      title: "Open-Source Transparency",
      description: "Check the code, audit the privacy",
      badge: "Transparent",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg"
    },
    {
      title: "100% Local",
      description: "Data never leaves your browser; we never ask for your TikTok password",
      badge: "Private",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/lock.svg"
    },
    {
      title: "Free Forever",
      description: "No hidden upgrade wall",
      badge: "Free",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gift.svg"
    },
    {
      title: "Rate Limit Protection",
      description: "Built-in throttling respects TikTok's limits for account safety",
      badge: "Protected",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shield.svg"
    }
  ];

  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Key Features
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to manage your TikTok reposts efficiently and safely
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-8 h-8"
                />
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
