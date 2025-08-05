import { Separator } from "@/components/ui/separator";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 处理锚点链接跳转
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // 如果不在首页，先跳转到首页再滚动
    if (location.pathname !== '/') {
      navigate('/');
      // 等待页面跳转完成后再滚动
      setTimeout(() => {
        scrollToElement(targetId);
      }, 100);
    } else {
      scrollToElement(targetId);
    }
  };

  const scrollToElement = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    const headerHeight = 80; // 估计的header高度
    
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - headerHeight - 20; // 额外20px间距
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 border-t border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/">
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
            </Link>
            <p className="text-gray-400 text-sm">
              The fastest way to clean up your TikTok profile by removing all reposts in one click.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleAnchorClick(e, 'features')}
                  className="hover:text-[#FE2C55] transition-colors hover:underline cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="hover:text-[#FE2C55] transition-colors hover:underline"
                >
                  Blog
                </Link>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => handleAnchorClick(e, 'faq')}
                  className="hover:text-[#FE2C55] transition-colors hover:underline cursor-pointer"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb" 
                  className="hover:text-[#FE2C55] transition-colors hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="mailto:support@tiktokrepostremover.com" 
                  className="hover:text-[#FE2C55] transition-colors hover:underline"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="hover:text-[#FE2C55] transition-colors hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="hover:text-[#FE2C55] transition-colors hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="/changelog"
                  className="text-gray-400 hover:text-[#FE2C55] transition-colors"
                  target="_self"
                  rel="noopener noreferrer"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#FE2C55]">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="https://github.com/BrittAbdula/tiktokrepostremover" 
                  className="hover:text-[#FE2C55] transition-colors flex items-center hover:underline group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" 
                    alt="GitHub" 
                    className="w-4 h-4 mr-2 filter invert group-hover:opacity-80 transition-opacity"
                  />
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://www.tiktok.com/@cleartok_2025" 
                  className="hover:text-[#FE2C55] transition-colors flex items-center hover:underline group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg" 
                    alt="TikTok" 
                    className="w-4 h-4 mr-2 filter invert group-hover:opacity-80 transition-opacity"
                  />
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="bg-gray-800 mb-8" />
        <div className="text-center text-gray-400 text-sm space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="font-medium text-gray-300 mb-2">
              <strong>Disclaimer:</strong>
            </p>
            <p className="text-sm leading-relaxed">
              This tool is not affiliated with or endorsed by TikTok. It runs locally in your browser. 
              For information about data collection, please see our <Link to="/privacy-policy" className="text-[#FE2C55] hover:underline">Privacy Policy</Link>. 
              ClearTok is an independent third-party extension designed to help users manage their TikTok content.
            </p>
          </div>
          <p>© 2025 ClearTok. Not affiliated with ByteDance or TikTok. "TikTok" is a trademark of ByteDance Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
