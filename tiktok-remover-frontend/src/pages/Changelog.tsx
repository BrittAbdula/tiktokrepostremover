import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const changelog = [
  {
    version: "v1.4.0",
    date: "2025-08-04",
    changes: [
      "Improved repost detection accuracy",
      "Maximized bulk deletion coverage",
    ],
  },
  {
    version: "v1.2.0",
    date: "2025-07-27",
    changes: [
      "Hot-update support",
      "When a newer tiktok UI version is detected, selectors are hot-reloaded without publishing a new build.",
    ],
  },
  {
    version: "v1.1.3",
    date: "2025-07-14",
    changes: [
      "Add Help us improve! Enviar comentarios",
      "Optimize processing logic",
    ],
  },
  {
    version: "v1.1.2",
    date: "2025-07-12",
    changes: [
      "Added multi-language support (French, Arabic, Japanese, Spanish, and more)",
    ],
  },
  {
    version: "v1.1.0",
    date: "2025-07-01",
    changes: [
      "One-click bulk removal of all TikTok reposts",
      "Automatic login detection and prompt",
      "Export and copy log of removed videos",
    ],
  },
  {
    version: "v1.0.0",
    date: "2025-06-15",
    changes: [
      "Initial public release of ClearTok",
      "Chrome extension for one-click TikTok repost cleanup",
    ],
  },
];
const Changelog = () => {
  return (
    <>
      <Helmet>
        <title>Changelog - ClearTok</title>
        <meta name="description" content="Recent updates and release notes for ClearTok, the TikTok Repost Remover extension." />
        <link rel="canonical" href="https://tiktokrepostremover.com/changelog" />
      </Helmet>
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2 text-white">Changelog</h1>
          <p className="text-gray-400 mb-8">See what's new and improved in ClearTok.</p>
          <div className="space-y-8">
            {changelog.map((entry, idx) => (
              <Card key={entry.version} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <span>{entry.version}</span>
                    <span className="text-xs text-gray-400 font-normal">{entry.date}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-gray-200">
                    {entry.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-8" />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Changelog; 