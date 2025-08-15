import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FaMobile, FaBell, FaCheck } from "react-icons/fa6";
import { subscribeToWaitlist } from "@/lib/api";

const WaitListSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await subscribeToWaitlist(email.trim());

      if (data.success) {
        setIsSubscribed(true);
        toast({
          title: "Successfully Joined!",
          description: data.message,
        });
        setEmail("");
      } else {
        toast({
          title: "Subscription Failed",
          description: data.message || "Failed to join waitlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : "Failed to connect to server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl relative overflow-hidden md:hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 hidden md:block pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-[#FE2C55] rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-[#00F2EA] rounded-full animate-bounce delay-150"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-[#FE2C55] rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-10 right-10 w-2 h-2 bg-[#00F2EA] rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full">
              <FaMobile className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Mobile App Coming Soon!
          </h2>
          
          <p className="text-lg text-gray-300 mb-2 max-w-2xl mx-auto">
            <strong className="text-[#FE2C55]">ClearTok Mobile</strong> - Take your TikTok repost removal on the go
          </p>
          
          <p className="text-base text-gray-400 mb-6 max-w-xl mx-auto">
            Be the first to know when our mobile app launches. Get early access and exclusive features.
          </p>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FE2C55] focus:ring-[#FE2C55]"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] 
                         text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/50 
                         transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaBell className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </div>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                <FaCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              You're on the list!
            </h3>
            <p className="text-gray-300">
              We'll notify you as soon as our mobile app is ready. Stay tuned!
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <FaCheck className="w-4 h-4 text-emerald-500 mr-2" />
              Early access
            </div>
            <div className="flex items-center">
              <FaCheck className="w-4 h-4 text-emerald-500 mr-2" />
              Exclusive features
            </div>
            <div className="flex items-center">
              <FaCheck className="w-4 h-4 text-emerald-500 mr-2" />
              No spam, ever
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitListSection;
