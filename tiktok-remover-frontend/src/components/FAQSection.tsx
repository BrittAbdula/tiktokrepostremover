import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const FAQSection = () => {
  const faqCategories = [
    {
      title: "🚀 Basic Features",
      description: "Essential functions and core capabilities",
      faqs: [
        {
          question: "How fast is this TikTok repost remover compared to manual deletion?",
          answer:
            "Our TikTok repost remover is approximately 3x faster than manual deletion. While manual removal takes about 10 seconds per video, ClearTok's TikTok repost remover technology completes the same task in roughly 3 seconds per video.",
        },
        {
          question: "How many reposts can the TikTok repost remover handle at once?",
          answer:
            "There's no limit to how many reposts our TikTok repost remover can process. The TikTok repost remover will continue removing reposts until your Reposts tab is completely empty, taking appropriate breaks to respect rate limits.",
        },
        {
          question:
            "Can the TikTok repost remover distinguish between my original content and reposts?",
          answer:
            "Yes! Our TikTok repost remover specifically targets only the content in your 'Reposts' tab on TikTok. The TikTok repost remover will never touch your original videos or content you've created.",
        },
        {
          question: "Does TikTok notify creators when I remove my repost?",
          answer: "No. Removing a repost is silent—original creators aren't alerted.",
        },
      ],
    },

    {
      title: "⚡ Advanced Features",
      description: "Background processing, monitoring & export capabilities",
      faqs: [
        {
          question:
            "Can I use other tabs while ClearTok is removing my reposts?",
          answer:
            "Yes! ClearTok works in the background, so you can switch tabs, browse other websites, or continue your work while the TikTok repost remover operates. You'll receive notifications about the progress.",
        },
        {
          question: "Can I get a list of all the videos that were deleted?",
          answer:
            "Absolutely! ClearTok automatically generates an export file containing all deleted video URLs, timestamps, and metadata. You can download this report when the process completes.",
        },
        {
          question:
            "How can I monitor the deletion progress in real-time?",
          answer:
            "ClearTok provides a live dashboard showing current progress, number of reposts found, deletion speed, estimated time remaining, and any errors encountered during the process.",
        },
        {
          question:
            "Can I pause or stop the TikTok repost remover during operation?",
          answer:
            "Yes! ClearTok's TikTok repost remover includes pause, resume, and stop controls. You can halt the TikTok repost remover process at any time and resume later from where it left off.",
        },
        {
          question:
            "Can I choose which reposts to keep before running the TikTok repost remover?",
          answer:
            "Yes. Use TikTok's native tools to remove individual reposts first, or favorite the videos you want to keep. Our TikTok repost remover will skip anything not in the active Reposts tab.",
        },
      ],
    },

    {
      title: "🔒 Security & Privacy",
      description: "Account safety and data protection",
      faqs: [
        {
          question:
            "Is this TikTok repost remover safe? Could my account be banned?",
          answer:
            "ClearTok's TikTok repost remover operates at human-like speed and only performs permitted UI actions. We've built advanced rate-limiting into our TikTok repost remover to respect TikTok's limits and protect your account.",
        },
        {
          question:
            "Is my data safe when using this TikTok repost remover?",
          answer:
            "Absolutely. Our TikTok repost remover operates entirely within your browser and never sends your data to external servers. The TikTok repost remover is completely open-source, so you can verify its privacy practices.",
        },
        {
          question:
            "What happens if the TikTok repost remover encounters an error?",
          answer:
            "Our TikTok repost remover has built-in error handling. If the TikTok repost remover encounters issues like network problems or rate limits, it will automatically retry or pause until conditions improve.",
        },
      ],
    },

    {
      title: "🛠️ Installation & Compatibility",
      description: "Setup, browser support and technical requirements",
      faqs: [
        {
          question: "How do I install the ClearTok TikTok repost remover?",
          answer:
            "Simply visit the Chrome Web Store, search for 'ClearTok TikTok repost remover', and click 'Add to Chrome'. The TikTok repost remover installs instantly and will appear in your browser toolbar.",
        },
        {
          question: "What browsers support this TikTok repost remover?",
          answer:
            "Our TikTok repost remover is designed for Chrome and Chromium-based browsers (Edge, Brave, Opera). The TikTok repost remover requires specific browser APIs that are only available in these browsers.",
        },
        {
          question: "Does this TikTok repost remover work on mobile devices?",
          answer:
            "Currently, our TikTok repost remover only works on desktop browsers. TikTok's mobile app restricts automation that our TikTok repost remover requires. Use Chrome or any Chromium-based browser on desktop/laptop.",
        },
        {
          question: "Can I schedule the TikTok repost remover to run at specific times?",
          answer:
            "Currently, our TikTok repost remover runs on-demand when you activate it. However, you can start the TikTok repost remover and let it run in the background while you do other tasks.",
        },
      ],
    },

    {
      title: "🆚 ClearTok vs SocialAut",
      description: "Pricing, platforms (PC vs mobile), safety, and openness",
      faqs: [
        {
          question: "Is SocialAut safe compared with ClearTok?",
          answer:
            "We can only speak for ClearTok. ClearTok is open-source, runs 100% locally in your browser on TikTok.com, and never asks for your TikTok password. SocialAut requires logging in with your TikTok account (password) inside its app and its code is not open for public audit. If safety is your priority, prefer tools that are open-source, local-only, and do not request passwords.",
        },
        {
          question: "Is there a Socialaut extension? How does the Socialaut extension compare to ClearTok?",
          answer:
            "ClearTok is a free Chrome/Edge **browser extension** for desktop. To our knowledge, SocialAut focuses on a mobile-app workflow and does not provide an official desktop browser extension. If you are searching for a 'Socialaut extension' on PC, ClearTok covers that desktop use case out of the box.",
        },
        {
          question: "SocialAut PC vs ClearTok: can I use it on a computer?",
          answer:
            "ClearTok is built for **PC** (Windows, macOS, Linux) via Chrome or Edge and works directly on TikTok.com. SocialAut primarily targets **mobile**; there is no native PC version. For bulk deletion on a computer, ClearTok is the recommended option.",
        },
        {
          question: "Is there a SocialAut online web version?",
          answer:
            "ClearTok works online in your browser—no app install, no account password required. SocialAut is a mobile app rather than a pure web ('online') tool. If you are looking for 'SocialAut online', ClearTok provides the online/desktop experience you need.",
        },
        {
          question: "How much does SocialAut cost compared to ClearTok?",
          answer:
            "ClearTok is **completely free**. SocialAut typically charges about **$5** for access (pricing may change). If you prefer a free solution with transparent, open-source code and no password login, choose ClearTok.",
        },
      ],
    },

    {
      title: "🏆 Comparison & Advantages",
      description: "How ClearTok stands out from alternatives",
      faqs: [
        {
          question:
            "What makes ClearTok different from other TikTok repost remover tools?",
          answer:
            "ClearTok is the only TikTok repost remover that offers background processing, real-time monitoring, and URL export features. Unlike other TikTok repost remover extensions, ClearTok is completely open-source and privacy-focused.",
        },
        {
          question:
            "Will this TikTok repost remover delete videos other people reposted of my content?",
          answer:
            "Unfortunately not. Only TikTok's report process can remove content from another user's profile. Our TikTok repost remover tool focuses exclusively on your own repost history.",
        },
      ],
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get answers to common questions about the ClearTok TikTok repost remover extension
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card
                key={categoryIndex}
                className="bg-gray-900/50 border-gray-700 hover:border-[#FE2C55]/50 transition-all duration-300 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    {category.title}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{category.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                        className="border-gray-700"
                      >
                        <AccordionTrigger className="text-left text-white hover:text-[#FE2C55] transition-colors text-sm">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300 text-sm">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
