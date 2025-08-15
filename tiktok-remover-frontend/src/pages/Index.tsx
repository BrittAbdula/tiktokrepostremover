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
import TopFeaturesSection from "@/components/TopFeaturesSection";
import LatestBlogSection from "@/components/LatestBlogSection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TikTok Repost Remover - Delete ALL Your Reposts in One Click</title>
        <meta name="description" content="ClearTok - The FREE TikTok Repost Remover extension erases every reposted video from your profile in seconds. 100% local, No password required. Safer, Faster." />
        <link rel="canonical" href="https://tiktokrepostremover.com/" />
        
        <meta property="og:title" content="TikTok Repost Remover - Delete ALL Reposts Instantly" />
        <meta property="og:description" content="One-click Extension to bulk delete all TikTok reposts. Maintain a clean feed & brand image. Free download." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tiktokrepostremover.com" />
        <meta property="og:image" content="https://tiktokrepostremover.com/images/og-banner.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TikTok Repost Remover - Delete ALL Reposts Instantly" />
        <meta name="twitter:description" content="One-click Extension to bulk delete all TikTok reposts. Maintain a clean feed & brand image. Free download." />
        <meta name="twitter:image" content="https://tiktokrepostremover.com/images/og-banner.png" />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://tiktokrepostremover.com/#organization",
                "name": "ClearTok",
                "url": "https://tiktokrepostremover.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://tiktokrepostremover.com/logo.png",
                  "width": 512,
                  "height": 512
                },
                "sameAs": [
                  "https://github.com/cleartok",
                  "https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb"
                ],
                "description": "Creator of ClearTok, the free TikTok repost remover Chrome extension."
              },
              {
                "@type": "WebApplication",
                "@id": "https://tiktokrepostremover.com/#webapp",
                "name": "ClearTok - TikTok Repost Remover",
                "url": "https://tiktokrepostremover.com",
                "description": "Delete all your TikTok reposts in one click. Clean up your profile instantly with ClearTok Chrome extension.",
                "applicationCategory": "BrowserApplication",
                "operatingSystem": "Chrome",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "publisher": {
                  "@id": "https://tiktokrepostremover.com/#organization"
                },
                "downloadUrl": "https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb",
                "screenshot": "https://tiktokrepostremover.com/images/oneclick.png",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1200",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "featureList": [
                  "Bulk delete all TikTok reposts",
                  "One-click repost removal",
                  "Real-time progress monitoring",
                  "Export deleted URLs",
                  "Background operation",
                  "Rate limit protection",
                  "100% local processing"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://tiktokrepostremover.com/#website",
                "url": "https://tiktokrepostremover.com",
                "name": "ClearTok - TikTok Repost Remover",
                "description": "The fastest way to delete all your TikTok reposts in one click.",
                "publisher": {
                  "@id": "https://tiktokrepostremover.com/#organization"
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://tiktokrepostremover.com/blog?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          })}
        </script>
        {/* FAQ Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is SocialAut safe compared with ClearTok?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ClearTok is open-source, runs 100% locally in your browser on TikTok.com, and never asks for your TikTok password. SocialAut requires logging in with your TikTok account (password) inside its app and its code is not publicly auditable."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a Socialaut extension? How does the Socialaut extension compare to ClearTok?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ClearTok is a free Chrome/Edge browser extension for desktop. To our knowledge, SocialAut focuses on a mobile-app workflow and does not provide an official desktop browser extension."
                }
              },
              {
                "@type": "Question",
                "name": "SocialAut PC vs ClearTok: can I use it on a computer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ClearTok is built for PC (Windows, macOS, Linux) via Chrome or Edge and works directly on TikTok.com. SocialAut primarily targets mobile and has no native PC version."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a SocialAut online web version?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ClearTok works online in your browser—no app install and no password login required. SocialAut is a mobile app rather than a pure web ('online') tool."
                }
              },
              {
                "@type": "Question",
                "name": "How much does SocialAut cost compared to ClearTok?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ClearTok is completely free. SocialAut typically charges about $5 for access (pricing may change). If you prefer a free, open-source option that never asks for your TikTok password, choose ClearTok."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-16">
          <HeroSection />
          <VideoDemoSection />
          <FeaturesSection />
          <TimeEstimatorSection />
          <ProblemSection />
          <HowItWorksSection />
          <TopFeaturesSection />
          <ScreenshotsSection />
          <LatestBlogSection />
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
