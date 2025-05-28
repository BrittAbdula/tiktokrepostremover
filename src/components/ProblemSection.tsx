
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProblemSection = () => {
  const problems = [
    {
      title: "Accidental Reposts",
      description: "The repost button sits centimeters from 'Like', leading to unwanted shares.",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/target.svg"
    },
    {
      title: "Brand Consistency",
      description: "Out-of-niche videos dilute your aesthetic & confuse followers.",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/brand.svg"
    },
    {
      title: "Privacy & Digital Footprint",
      description: "Remove dated or controversial content fast.",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shield.svg"
    },
    {
      title: "No Native Bulk Delete",
      description: "TikTok forces you to remove reposts one-by-one. Our extension automates the grind.",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/automate.svg"
    }
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Why You Need a TikTok Repost Remover
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Managing TikTok reposts manually is time-consuming and frustrating. Here's why you need an automated solution.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((problem, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-all bg-gray-900 border-gray-800 hover:border-[#FE2C55]/50">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] rounded-full flex items-center justify-center">
                <img 
                  src={problem.icon} 
                  alt={problem.title} 
                  className="w-6 h-6 filter invert"
                />
              </div>
              <CardTitle className="text-lg text-white">{problem.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-300">
                {problem.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ProblemSection;
