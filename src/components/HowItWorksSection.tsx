
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Sign In",
      description: "Sign in to TikTok.com on Chrome browser",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/login.svg"
    },
    {
      step: "2", 
      title: "Open Extension",
      description: "Open the 'TikTok Repost Remover' icon & click Start Removing",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/extension.svg"
    },
    {
      step: "3",
      title: "Sit Back & Relax",
      description: "The tool scans your Reposts tab and clicks 'Remove Repost' on every video—safely respecting TikTok rate-limits",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/automation.svg"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-900 rounded-2xl border border-gray-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Three simple steps to clean up your TikTok profile in minutes
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="relative">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center">
                <img 
                  src={step.icon} 
                  alt={step.title} 
                  className="w-8 h-8 filter invert"
                />
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
