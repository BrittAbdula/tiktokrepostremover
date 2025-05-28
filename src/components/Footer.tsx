
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center">
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg" 
                  alt="TikTok Icon" 
                  className="w-4 h-4 filter invert"
                />
              </div>
              <h3 className="text-lg font-bold">TikTok Repost Remover</h3>
            </div>
            <p className="text-gray-400 text-sm">
              The fastest way to clean up your TikTok profile by removing all reposts in one click.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-[#FE2C55] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#FE2C55] transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-[#FE2C55] transition-colors">FAQ</a></li>
              <li><a href="#download" className="hover:text-[#FE2C55] transition-colors">Download</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@tiktokrepostremover.com" className="hover:text-[#FE2C55] transition-colors">Contact Support</a></li>
              <li><a href="/privacy" className="hover:text-[#FE2C55] transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-[#FE2C55] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://github.com/your-repo" className="hover:text-[#FE2C55] transition-colors flex items-center">
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" 
                  alt="GitHub" 
                  className="w-4 h-4 mr-2 filter invert"
                />
                GitHub
              </a></li>
              <li><a href="https://twitter.com/your-handle" className="hover:text-[#FE2C55] transition-colors flex items-center">
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" 
                  alt="Twitter" 
                  className="w-4 h-4 mr-2 filter invert"
                />
                Twitter
              </a></li>
            </ul>
          </div>
        </div>
        <Separator className="bg-gray-800 mb-8" />
        <div className="text-center text-gray-400 text-sm">
          <p>© 2024 TikTok Repost Remover. Not affiliated with ByteDance or TikTok. "TikTok" is a trademark of ByteDance Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
