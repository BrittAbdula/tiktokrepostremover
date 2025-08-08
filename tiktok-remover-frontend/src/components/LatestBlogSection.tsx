import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";

const LatestBlogSection = () => {
  // Get latest 3 blog posts sorted by publish date (newest first)
  const latestPosts = blogPosts
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 3);

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Latest from Our Blog
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Stay updated with TikTok tips, tutorials, and insights
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {latestPosts.map((post) => (
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
                {post.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button asChild className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white w-full">
                <Link to={`/blog/${post.slug}`} className="flex items-center justify-center gap-2">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Button asChild variant="outline" className="border-[#00F2EA]/50 text-[#00F2EA] hover:bg-[#00F2EA] hover:border-[#00F2EA] hover:text-black">
          <Link to="/blog" className="flex items-center gap-2">
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default LatestBlogSection; 