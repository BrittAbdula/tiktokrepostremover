
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ComparisonSection from "@/components/ComparisonSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SecuritySection />
        <TestimonialsSection />
        <FAQSection />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
