import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "I deleted 870 reposts in 12 minutes. My feed finally looks professional again.",
      author: "@digitalmarketer",
      role: "Digital Marketing Specialist"
    },
    {
      quote: "I kept hitting the repost button by mistake. This extension fixed a year of clutter overnight.",
      author: "@fitnesscreator",
      role: "Fitness Content Creator"
    },
    {
      quote: "As a brand manager, this tool saved me hours of manual work. Highly recommended!",
      author: "@brandmanager",
      role: "Social Media Manager"
    }
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          User Results
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          See what our users are saying about their experience
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="hover:shadow-xl hover:shadow-[#FE2C55]/20 transition-all duration-300 bg-gray-900 border-gray-800 hover:border-[#FE2C55]/50">
            <CardHeader>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#00F2EA] text-lg">★</span>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-gray-300 mb-4 italic">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <CardTitle className="text-sm font-semibold text-[#FE2C55]">
                  {testimonial.author}
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  {testimonial.role}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
