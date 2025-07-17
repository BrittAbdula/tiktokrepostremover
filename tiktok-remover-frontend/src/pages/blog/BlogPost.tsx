import { useParams, Link, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPostBySlug } from "@/data/blogData";
import { Helmet } from "react-helmet-async";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo, useEffect, useState } from "react";

// Utility to generate slug ids from heading text
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  // Extract headings for table of contents (h2 & h3)
  const headings = useMemo(() => {
    if (!post) return [] as { level: number; text: string; id: string }[];
    const regex = /^###?\s+(.*)$/gm;
    const matches = [...post.content.matchAll(regex)];
    return matches.map((m) => {
      const isH3 = m[0].startsWith("###");
      const text = m[1].trim();
      return {
        level: isH3 ? 3 : 2,
        text,
        id: slugify(text),
      };
    });
  }, [post?.content]);

  // Track active heading for TOC highlight
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150; // offset for fixed header and scroll-mt
      let current = "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.offsetTop <= scrollPos) {
          current = h.id;
        }
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // 使用 react-markdown 解析并渲染 Markdown
  const markdownComponents: Components = {
    h2: ({ node, children, ...props }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="text-2xl font-bold text-white mt-8 mb-4 scroll-mt-28" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="text-xl font-bold text-white mt-6 mb-3 scroll-mt-28" {...props}>
          {children}
        </h3>
      );
    },
    p: ({node, ...props}) => (
      <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
    ),
    li: ({node, ...props}) => (
      <li
        className="text-gray-300 mb-2 ml-4 list-disc"
        {...props}
      />
    ),
    a: ({node, ...props}) => (
      <a
        className="text-[#00F2EA] hover:text-[#FE2C55] transition-colors underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    img: ({node, ...props}) => (
      <div className="my-8 text-center">
        <img
          className="max-w-full h-auto mx-auto rounded-lg shadow-lg border border-gray-700"
          {...props}
        />
      </div>
    ),
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
        
        {/* Structured Data for Blog Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.image ? `https://tiktokrepostremover.com${post.image}` : "https://tiktokrepostremover.com/logo.png",
            "author": {
              "@type": "Organization",
              "name": post.author || "ClearTok Team",
              "url": "https://tiktokrepostremover.com"
            },
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
            "datePublished": post.publishDate,
            "dateModified": post.publishDate,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://tiktokrepostremover.com/blog/${post.slug}`
            },
            "keywords": post.tags?.join(", "),
            "articleSection": "TikTok Tips",
            "inLanguage": "en-US",
            "url": `https://tiktokrepostremover.com/blog/${post.slug}`
          })}
        </script>
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

          {/* 文章头部 & 内容布局 */}
          <article className="lg:flex lg:gap-8 max-w-6xl mx-auto">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <aside className="hidden lg:block lg:w-1/4 sticky top-28 max-h-[80vh] overflow-auto pr-4 border-r border-gray-800">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  In This Article
                </h3>
                <ul className="space-y-2">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                      <a
                        href={`#${h.id}`}
                        className={`text-gray-400 hover:text-white text-sm transition-colors ${activeId === h.id ? 'font-bold' : ''}`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1">

            {/* 文章头部 */}
            <header className="mb-8">
              {post.image && (
                <div className="mb-6 -mx-4 sm:mx-0 overflow-hidden rounded-lg">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full object-cover aspect-[3/2]"
                  />
                </div>
              )}
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
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
                      <a href="https://tiktokrepostremover.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
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
            </div> {/* End of main content wrapper */}
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogPost; 