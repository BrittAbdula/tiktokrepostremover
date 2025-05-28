
import { Button } from "@/components/ui/button";

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
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all" asChild>
            <a href="https://chrome.google.com/webstore/detail/your-extension-id">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg" 
                alt="Chrome" 
                className="w-5 h-5 mr-2"
              />
              Add to Chrome – It's Free
            </a>
          </Button>
        </div>
        <p className="text-sm opacity-80">
          No sign-up • Instant install • Works worldwide
        </p>
        <div className="flex justify-center items-center space-x-6 mt-8 text-sm opacity-80">
          <div className="flex items-center">
            <img 
              src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shield.svg" 
              alt="Secure" 
              className="w-4 h-4 mr-2 filter invert"
            />
            100% Secure
          </div>
          <div className="flex items-center">
            <img 
              src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" 
              alt="Open Source" 
              className="w-4 h-4 mr-2 filter invert"
            />
            Open Source
          </div>
          <div className="flex items-center">
            <img 
              src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/privacy.svg" 
              alt="Privacy" 
              className="w-4 h-4 mr-2 filter invert"
            />
            Privacy First
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
