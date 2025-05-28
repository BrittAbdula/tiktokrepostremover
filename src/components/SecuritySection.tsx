
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SecuritySection = () => {
  const securityFeatures = [
    {
      title: "Zero External Servers",
      description: "No trackers, analytics, or data collection",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/server.svg"
    },
    {
      title: "Open-Source MIT License",
      description: "Available on GitHub for community audit",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/opensource.svg"
    },
    {
      title: "Easy Uninstall",
      description: "Remove at any moment—your TikTok account remains intact",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/uninstall.svg"
    }
  ];

  return (
    <section className="py-16 bg-green-50 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Security & Privacy First
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Our extension runs entirely in your browser session and uses TikTok's public web interface, 
          the same clicks you could do manually:
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {securityFeatures.map((feature, index) => (
          <Card key={index} className="text-center bg-white border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-6 h-6"
                />
              </div>
              <CardTitle className="text-lg text-green-800">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-600">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SecuritySection;
