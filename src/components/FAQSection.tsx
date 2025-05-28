
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Does TikTok notify creators when I remove my repost?",
      answer: "No. Removing a repost is silent—original creators aren't alerted."
    },
    {
      question: "Will this extension delete videos other people reposted of my content?",
      answer: "Unfortunately not. Only TikTok's report process can remove content from another user's profile. Our tool focuses on your own repost history."
    },
    {
      question: "Is it safe? Could my account be banned?",
      answer: "The extension operates at human-like speed and only performs permitted UI actions. We've built-in throttling to respect TikTok's limits, but use common sense—avoid running it repeatedly in short periods."
    },
    {
      question: "Can I choose which reposts to keep?",
      answer: "Yes. Use TikTok's native tools to remove individual reposts, or run our extension after you've favorited the videos you want to keep—it will skip anything not in the Reposts tab."
    },
    {
      question: "Does it work on mobile?",
      answer: "Not yet. TikTok's mobile app restricts automation. Use a desktop/laptop with Chrome or any Chromium-based browser."
    },
    {
      question: "How many reposts can it remove at once?",
      answer: "There's no limit. The extension will continue removing reposts until your Reposts tab is empty, taking breaks to respect TikTok's rate limits."
    }
  ];

  return (
    <section id="faq" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get answers to common questions about the TikTok Repost Remover extension
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
