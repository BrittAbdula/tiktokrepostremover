import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogData";
import { Helmet } from "react-helmet-async";

const BlogList = () => {
  // Sort posts by publish date (newest first) and get featured post
  const sortedPosts = blogPosts.sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  const featuredPost = sortedPosts.find(post => post.featured);
  const otherPosts = sortedPosts.filter(post => !post.featured);

  return (
    <>
      <Helmet>
        <title>ClearTok Blog | TikTok Repost Remover Tips & Tutorials</title>
        <link  rel="canonical"  href={`https://tiktokrepostremover.com/blog`}/>
        <meta name="description" content="Stay updated with the latest TikTok tips, tricks, and tutorials for managing your reposts and cleaning up your profile with ClearTok." />
        <meta property="og:title" content="ClearTok Blog | TikTok Repost Remover Tips & Tutorials" />
        <meta property="og:description" content="Stay updated with the latest TikTok tips, tricks, and tutorials for managing your reposts and cleaning up your profile with ClearTok." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tiktokrepostremover.com/blog" />
        <meta property="og:image" content="https://tiktokrepostremover.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ClearTok Blog | TikTok Repost Remover Tips & Tutorials" />
        <meta name="twitter:description" content="Stay updated with the latest TikTok tips, tricks, and tutorials for managing your reposts and cleaning up your profile with ClearTok." />
        <meta name="twitter:image" content="https://tiktokrepostremover.com/logo.png" />
        
        {/* Structured Data for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "ClearTok Blog",
            "description": "Stay updated with the latest TikTok tips, tricks, and tutorials for managing your reposts and cleaning up your profile with ClearTok.",
            "url": "https://tiktokrepostremover.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "ClearTok",
              "url": "https://tiktokrepostremover.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://tiktokrepostremover.com/logo.png",
                "width": 512,
                "height": 512
              }
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "url": `https://tiktokrepostremover.com/blog/${post.slug}`,
              "datePublished": post.publishDate,
              "author": {
                "@type": "Organization",
                "name": post.author || "ClearTok Team"
              },
              "image": post.image ? `https://tiktokrepostremover.com${post.image}` : "https://tiktokrepostremover.com/logo.png"
            })),
            "inLanguage": "en-US"
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              ClearTok Blog
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Stay updated with the latest TikTok tips, tricks, and tutorials for managing your content
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white">
                Featured Post
              </Badge>
              <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="overflow-hidden">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full object-cover aspect-[3/2]"
                    />
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {featuredPost.publishDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4 line-clamp-2">
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="text-white hover:text-[#FE2C55] transition-colors"
                      >
                        {featuredPost.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55]">
                      <Link to={`/blog/${featuredPost.slug}`} className="flex items-center gap-2">
                        Read Full Article
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {/* Other Posts Grid */}
          {otherPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Latest Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                  <Card key={post.id} className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-[#FE2C55]/50 transition-all duration-300 group">
                    <CardHeader>
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full object-cover aspect-[3/2] rounded-md mb-4"
                        />
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {post.publishDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <CardTitle className="line-clamp-2">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-white group-hover:text-[#FE2C55] transition-colors duration-300"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      
                      <CardDescription className="text-gray-300 line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white">
                        <Link to={`/blog/${post.slug}`} className="flex items-center gap-2">
                          Read Article
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-700 shadow-2xl shadow-[#FE2C55]/10 relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#FE2C55]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00F2EA]/10 rounded-full blur-3xl"></div>
              
              <CardContent className="p-8 relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to Clean Up Your TikTok?
                </h3>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Download ClearTok and start removing your reposts with our simple Chrome extension
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/30 transition-all duration-300 transform hover:scale-105">
                  <a href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Get ClearTok Free
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogList; 