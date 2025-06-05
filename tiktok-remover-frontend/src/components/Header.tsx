import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
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
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#calculator" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium 
                                           relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                                           after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                                           hover:after:w-full after:transition-all after:duration-300">
            Calculator
          </a>
          <a href="#features" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                                         relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                                         after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                                         hover:after:w-full after:transition-all after:duration-300">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                                             relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                                             after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                                             hover:after:w-full after:transition-all after:duration-300">
            How It Works
          </a>
          <a href="#faq" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium
                                    relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                                    after:bg-gradient-to-r after:from-[#FE2C55] after:to-[#00F2EA] 
                                    hover:after:w-full after:transition-all after:duration-300">
            FAQ
          </a>
          <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                                   text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 transition-all duration-300
                                   transform hover:scale-105">
            <a href="#download">
            <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg" 
                alt="Chrome" 
                className="w-5 h-5 mr-2 filter invert"
              />Download ClearTok</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
