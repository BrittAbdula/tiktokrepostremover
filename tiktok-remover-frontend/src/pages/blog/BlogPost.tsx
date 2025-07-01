import { useParams, Link, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPostBySlug } from "@/data/blogData";
import { Helmet } from "react-helmet-async";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }
  
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }
  
  // 处理 Markdown 样式的内容渲染
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // 处理标题
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      }
      
      // 处理图片
      if (line.trim().startsWith('![')) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, alt, src] = match;
          return (
            <div key={index} className="my-8 text-center">
              <img 
                src={src} 
                alt={alt} 
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg border border-gray-700"
              />
              {alt && (
                <p className="text-gray-400 text-sm mt-2 italic">{alt}</p>
              )}
            </div>
          );
        }
      }
      
      // 处理 YouTube 视频链接（特殊格式）
      if (line.trim().startsWith('[![') && line.includes('youtube.com')) {
        const match = line.match(/\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)/);
        if (match) {
          const [, alt, thumbnail, videoUrl] = match;
          return (
            <div key={index} className="my-8">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <img 
                    src={thumbnail} 
                    alt={alt}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          );
        }
      }
      
      // 处理段落
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // 处理列表项
      if (line.trim().startsWith('- ')) {
        return (
          <li key={index} className="text-gray-300 mb-2 ml-4">
            {line.replace('- ', '')}
          </li>
        );
      }
      
      // 处理数字列表
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={index} className="text-gray-300 mb-2 ml-4">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      
      // 处理链接和粗体文本
      const processedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#FE2C55] font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00F2EA] hover:text-[#FE2C55] transition-colors underline">$1</a>');
      
      // 普通段落
      return (
        <p key={index} className="text-gray-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />
      );
    });
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | ClearTok Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://tiktokrepostremover.com/blog/${post.slug}`}/>
        <meta property="og:title" content={`${post.title} | ClearTok Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://tiktokrepostremover.com/blog/${post.slug}`} />
        <meta property="og:image" content={`https://tiktokrepostremover.com${post.image || '/logo.png'}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | ClearTok Blog`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={`https://tiktokrepostremover.com${post.image || '/logo.png'}`} />
      </Helmet>
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* 返回按钮 */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
              <Link to="/blog" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </Button>
          </div>

          {/* 文章头部 */}
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {post.publishDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
              </div>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                {post.excerpt}
              </p>
            </header>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              <div className="space-y-4">
                {renderContent(post.content)}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16">
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-700 shadow-2xl shadow-[#FE2C55]/10 relative overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#FE2C55]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00F2EA]/10 rounded-full blur-3xl"></div>
                
                <CardContent className="p-8 text-center relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Ready to Try ClearTok?
                  </h3>
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Stop deleting reposts one by one. Get ClearTok and clean up your entire TikTok profile in minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:from-[#FF0050] hover:to-[#FE2C55] text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl hover:shadow-[#FE2C55]/30 transition-all duration-300 transform hover:scale-105">
                      <a href="https://chromewebstore.google.com/detail/cleartok-repost-remover/kmellgkfemijicfcpndnndiebmkdginb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Get ClearTok Free
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-[#00F2EA]/50 text-[#00F2EA] hover:bg-[#00F2EA] hover:border-[#00F2EA] hover:text-black font-semibold px-8 py-4 transition-all duration-300 transform hover:scale-105">
                      <a href="https://tiktokrepostremover.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                        Visit Website
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 导航到其他文章 */}
            <div className="mt-12 flex justify-between items-center">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link to="/blog" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  More Articles
                </Link>
              </Button>
            </div>
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogPost; 