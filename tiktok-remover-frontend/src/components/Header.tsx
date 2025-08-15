import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaChrome, FaEdge } from "react-icons/fa6";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 浏览器识别（Chrome / Edge / 其他）
  const [browser, setBrowser] = useState<'chrome' | 'edge' | 'other'>('other');
  useEffect(() => {
    try {
      const ua = navigator.userAgent || '';
      if (/Edg/i.test(ua)) {
        setBrowser('edge');
        return;
      }
      if (/(Chrome|CriOS)/i.test(ua) && !/(OPR|Opera|Edg|SamsungBrowser)/i.test(ua)) {
        setBrowser('chrome');
        return;
      }
      setBrowser('other');
    } catch {
      setBrowser('other');
    }
  }, []);
  const showChrome = browser === 'chrome' || browser === 'other';
  const showEdge = browser === 'edge' || browser === 'other';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 处理平滑滚动到锚点，考虑header高度
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // 关闭移动端菜单
    setIsMobileMenuOpen(false);
    
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
    const headerHeight = headerRef.current?.offsetHeight || 80; // 默认80px作为fallback
    
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - headerHeight - 20; // 额外20px间距
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  };

  // 处理Logo点击，返回首页顶部
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header ref={headerRef} className="bg-black/95 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" onClick={handleLogoClick}>
          <div className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center 
                          group-hover:shadow-lg group-hover:shadow-[#FE2C55]/50 transition-all duration-300">
              <img 
                src="/logo.png" 
                alt="ClearTok Icon" 
                className="w-5 h-5 filter"
                />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-bold text-white group-hover:text-[#FE2C55] transition-colors">
                ClearTok
              </p>
              <p className="text-xs text-gray-400 hidden sm:block">
                TikTok Repost Remover
              </p>
            </div>
          </div>
        </a>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center space-x-6">
          <a 
            href="#calculator" 
            onClick={(e) => handleAnchorClick(e, 'calculator')}
            className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium 
                       relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                       after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                       hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
          >
            Estimator
          </a>
          <a 
            href="#features" 
            onClick={(e) => handleAnchorClick(e, 'features')}
            className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                       relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                       after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                       hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleAnchorClick(e, 'how-it-works')}
            className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                       relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                       after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                       hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
          >
            How It Works
          </a>
          <Link 
            to="/blog"
            className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                       relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                       after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                       hover:after:w-full after:transition-all after:duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <a 
            href="#faq" 
            onClick={(e) => handleAnchorClick(e, 'faq')}
            className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                       relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                       after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                       hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
          >
            FAQ
          </a>
          {showChrome && (
            <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 transition-all duration-300
                                     transform hover:scale-105">
              <a 
                href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <FaChrome className="w-5 h-5 mr-2" />
                Add to Chrome
              </a>
            </Button>
          )}
          {showEdge && (
            <Button asChild className="bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#0078D4]
                                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#0078D4]/50 transition-all duration-300
                                     transform hover:scale-105">
              <a 
                href="https://microsoftedge.microsoft.com/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <FaEdge className="w-5 h-5 mr-2" />
                Add to Edge
              </a>
            </Button>
          )}
        </nav>

        {/* 移动端汉堡菜单按钮 */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1.5 
                     hover:bg-gray-800/50 rounded-lg transition-all duration-300"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span 
            className={`w-5 h-0.5 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span 
            className={`w-5 h-0.5 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span 
            className={`w-5 h-0.5 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* 移动端导航菜单 */}
            <div
        className={`md:hidden bg-black/98 backdrop-blur-sm border-t border-gray-800/50 transition-all duration-300 overflow-x-hidden ${
          isMobileMenuOpen ? 'max-h-[75vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <nav className="container mx-auto px-4 py-4 space-y-4">
          <a 
            href="#calculator" 
            onClick={(e) => handleAnchorClick(e, 'calculator')}
            className="block text-gray-300 hover:text-[#FE2C55] transition-colors font-medium py-2 px-4 rounded-lg
                       hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50 cursor-pointer"
          >
            Estimator
          </a>
          <a 
            href="#features" 
            onClick={(e) => handleAnchorClick(e, 'features')}
            className="block text-gray-300 hover:text-[#FE2C55] transition-colors font-medium py-2 px-4 rounded-lg
                       hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50 cursor-pointer"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleAnchorClick(e, 'how-it-works')}
            className="block text-gray-300 hover:text-[#FE2C55] transition-colors font-medium py-2 px-4 rounded-lg
                       hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50 cursor-pointer"
          >
            How It Works
          </a>
          <Link 
            to="/blog"
            className="block text-gray-300 hover:text-[#FE2C55] transition-colors font-medium py-2 px-4 rounded-lg
                       hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <a 
            href="#faq" 
            onClick={(e) => handleAnchorClick(e, 'faq')}
            className="block text-gray-300 hover:text-[#FE2C55] transition-colors font-medium py-2 px-4 rounded-lg
                       hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50 cursor-pointer"
          >
            FAQ
          </a>
          {showChrome && (
            <Button asChild className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 transition-all duration-300
                                     mt-4">
              <a 
                href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb?utm_source=cleartok_website"
                className="flex items-center justify-center" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaChrome className="w-5 h-5 mr-2" />
                Download for Chrome
              </a>
            </Button>
          )}
          {showEdge && (
            <Button asChild className="w-full bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#0078D4]
                                     text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#0078D4]/50 transition-all duration-300
                                     mt-2">
              <a 
                href="https://microsoftedge.microsoft.com/addons/detail/cleartok-tiktok-repost-/bgbcmapbnbdmmjibajjagnlbbdhcenoc"
                className="flex items-center justify-center" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaEdge className="w-5 h-5 mr-2" />
                Download for Edge
              </a>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
