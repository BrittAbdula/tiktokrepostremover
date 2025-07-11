import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found (404) | ClearTok - TikTok Repost Remover</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to ClearTok homepage to download our free TikTok repost remover Chrome extension." />
        <link rel="canonical" href="https://tiktokrepostremover.com/404" />
        
        <meta property="og:title" content="Page Not Found | ClearTok - TikTok Repost Remover" />
        <meta property="og:description" content="The page you're looking for doesn't exist. Return to ClearTok homepage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://tiktokrepostremover.com${location.pathname}`} />
        <meta property="og:image" content="https://tiktokrepostremover.com/logo.png" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Page Not Found | ClearTok - TikTok Repost Remover" />
        <meta name="twitter:description" content="The page you're looking for doesn't exist. Return to ClearTok homepage." />
        <meta name="twitter:image" content="https://tiktokrepostremover.com/logo.png" />
        
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
              <CardContent className="p-12 relative z-10">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">404</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
                  <p className="text-xl text-gray-300 mb-8">
                    Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL was mistyped.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white mb-2">What you can do:</h2>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Check the URL for typos</li>
                      <li>• Return to the homepage</li>
                      <li>• Browse our blog for TikTok tips</li>
                      <li>• Download the ClearTok extension</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white font-bold">
                    <Link to="/" className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Back to Homepage
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="border-[#00F2EA]/50 text-[#00F2EA] hover:bg-[#00F2EA] hover:border-[#00F2EA] hover:text-black">
                    <Link to="/blog" className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Browse Blog
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-4">
                    Were you looking for help with TikTok repost removal?
                  </p>
                  <Button asChild className="bg-gradient-to-r from-[#00F2EA] to-[#25F4EE] hover:from-[#25F4EE] hover:to-[#00F2EA] text-black font-bold">
                    <a 
                      href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Get ClearTok Extension
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFound;
