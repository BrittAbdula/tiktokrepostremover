
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg" 
            alt="TikTok Icon" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-900">TikTok Repost Remover</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
          <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
          <Button asChild>
            <a href="#download">Download Extension</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
