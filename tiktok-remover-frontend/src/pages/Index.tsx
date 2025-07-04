import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import SecuritySection from "@/components/SecuritySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ComparisonSection from "@/components/ComparisonSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import TimeEstimatorSection from "@/components/TimeEstimatorSection";
import VideoDemoSection from "@/components/VideoDemoSection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://tiktokrepostremover.com" />
        <title>ClearTok | TikTok Repost Remover</title>
        <meta name="description" content="Delete all your TikTok reposts in one click. Clean up your profile instantly with ClearTok Chrome extension." />
      </Helmet>
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-16">
          <HeroSection />
          <VideoDemoSection />
          <TimeEstimatorSection />
          <ProblemSection />
          <HowItWorksSection />
          <FeaturesSection />
          <ScreenshotsSection />
          <SecuritySection />
          <TestimonialsSection />
          <ComparisonSection />
          <CTASection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
