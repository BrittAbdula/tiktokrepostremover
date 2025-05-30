
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="TikTok Repost Remover Icon" 
              className="w-5 h-5 filter "
              />
          </div>
          <p className="text-xl font-bold text-white">TikTok Repost Remover</p>
        </div>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#calculator" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium">Calculator</a>
          <a href="#features" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium">How It Works</a>
          <a href="#faq" className="text-gray-300 hover:text-[#FE2C55] transition-colors font-medium">FAQ</a>
          <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white font-bold">
            <a href="#download">
            <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg" 
                alt="Chrome" 
                className="w-5 h-5 mr-2"
              />Download Extension</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
