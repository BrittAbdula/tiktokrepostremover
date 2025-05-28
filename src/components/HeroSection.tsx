
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <section className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
      <div className="max-w-4xl mx-auto px-4">
        <Badge variant="secondary" className="mb-4">
          Free Chrome Extension
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          TikTok Repost Remover Extension
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          <strong>Delete every reposted TikTok video in one click.</strong><br />
          Clean up your profile, fix accidental shares, and keep your brand on point.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <a href="#download">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg" 
                alt="Chrome" 
                className="w-5 h-5 mr-2 filter invert"
              />
              Get the Free Chrome Extension
            </a>
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Works on TikTok.com • Secure • No password stored
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
