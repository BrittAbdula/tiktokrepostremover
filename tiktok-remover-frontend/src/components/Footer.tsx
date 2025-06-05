import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 border-t border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="w-6 h-6 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-[#FE2C55]/50 transition-all duration-300">
                <img 
                  src="/logo.png" 
                  alt="ClearTok Icon" 
                  className="w-4 h-4 filter invert"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold group-hover:text-[#FE2C55] transition-colors">ClearTok</h3>
                <p className="text-xs text-gray-400">TikTok Repost Remover</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              The fastest way to clean up your TikTok profile by removing all reposts in one click.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-[#FE2C55] transition-colors hover:underline">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#FE2C55] transition-colors hover:underline">How It Works</a></li>
              <li><a href="#faq" className="hover:text-[#FE2C55] transition-colors hover:underline">FAQ</a></li>
              <li><a href="#download" className="hover:text-[#FE2C55] transition-colors hover:underline">Download</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@tiktokrepostremover.com" className="hover:text-[#FE2C55] transition-colors hover:underline">Contact Support</a></li>
              <li><a href="/privacy-policy" className="hover:text-[#FE2C55] transition-colors hover:underline">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-[#FE2C55] transition-colors hover:underline">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://github.com/BrittAbdula/tiktokrepostremover" className="hover:text-[#FE2C55] transition-colors flex items-center hover:underline group">
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" 
                  alt="GitHub" 
                  className="w-4 h-4 mr-2 filter invert group-hover:opacity-80 transition-opacity"
                />
                GitHub
              </a></li>
              {/* <li><a href="https://twitter.com/your-handle" className="hover:text-[#FE2C55] transition-colors flex items-center">
                <img 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" 
                  alt="Twitter" 
                  className="w-4 h-4 mr-2 filter invert"
                />
                Twitter
              </a></li> */}
            </ul>
          </div>
        </div>
        <Separator className="bg-gray-800 mb-8" />
        <div className="text-center text-gray-400 text-sm">
          <p>© 2025 ClearTok. Not affiliated with ByteDance or TikTok. "TikTok" is a trademark of ByteDance Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
