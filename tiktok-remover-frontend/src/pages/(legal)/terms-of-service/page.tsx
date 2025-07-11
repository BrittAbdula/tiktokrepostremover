import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
    return (
      <>
        <Helmet>
          <title>Terms of Service | ClearTok - TikTok Repost Remover</title>
          <meta name="description" content="Read the terms of service for ClearTok, the free TikTok repost remover Chrome extension. Learn about usage guidelines and user responsibilities." />
          <link rel="canonical" href="https://tiktokrepostremover.com/terms-of-service" />
          
          <meta property="og:title" content="Terms of Service | ClearTok - TikTok Repost Remover" />
          <meta property="og:description" content="Read the terms of service for ClearTok, the free TikTok repost remover Chrome extension." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://tiktokrepostremover.com/terms-of-service" />
          <meta property="og:image" content="https://tiktokrepostremover.com/logo.png" />
          
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Terms of Service | ClearTok - TikTok Repost Remover" />
          <meta name="twitter:description" content="Read the terms of service for ClearTok, the free TikTok repost remover Chrome extension." />
          <meta name="twitter:image" content="https://tiktokrepostremover.com/logo.png" />
        </Helmet>
        
        <div className="min-h-screen bg-black">
          <Header />
          <main className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                <p className="mt-2 text-gray-400">Effective Date: May 14, 2025</p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Definitions</h2>
                <p className="text-gray-300">In these Terms of Service, the following definitions apply:</p>
                <ul className="list-disc space-y-2 pl-6 text-gray-300">
                  <li>
                    <strong className="text-white">ClearTok</strong>: The website and Chrome extension operated by ClearTok Inc.
                  </li>
                  <li>
                    <strong className="text-white">Service</strong>: The ClearTok platform and all related services provided by ClearTok Inc.
                  </li>
                  <li>
                    <strong className="text-white">User</strong>: Any individual or entity that accesses or uses the Service.
                  </li>
                  <li>
                    <strong className="text-white">Content</strong>: All text, images, videos, audio, or other materials uploaded, submitted, or
                    displayed on the Service.
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. User Accounts</h2>
                <p className="text-gray-300">
                  To use the Service, you must have a valid TikTok account. You are responsible for maintaining the confidentiality of
                  your TikTok account credentials and for all activities that occur under your account.
                </p>
                <p className="text-gray-300">
                  You agree to provide accurate and complete information when using our service and to update this
                  information as necessary to keep it current.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Use of the Service</h2>
                <p className="text-gray-300">
                  ClearTok is designed to help users manage their TikTok reposts by providing automated deletion functionality.
                  You agree to use the Service only for lawful purposes and in accordance with these Terms.
                </p>
                <p className="text-gray-300">
                  You may not use the Service to violate TikTok's terms of service or engage in any activity that could harm
                  TikTok's platform or other users.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">4. Privacy and Data</h2>
                <p className="text-gray-300">
                  ClearTok operates entirely within your browser and does not store your TikTok credentials or personal data
                  on our servers. All processing happens locally in your browser session.
                </p>
                <p className="text-gray-300">
                  For more information about how we handle data, please review our Privacy Policy.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">5. Service Availability</h2>
                <p className="text-gray-300">
                  We strive to maintain high availability of our Service, but we do not guarantee that the Service will be
                  available at all times. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">6. Limitation of Liability</h2>
                <p className="text-gray-300">
                  ClearTok is provided "as is" without any warranties. We are not liable for any damages arising from your use
                  of the Service, including but not limited to loss of data or account suspension by TikTok.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">7. Changes to Terms</h2>
                <p className="text-gray-300">
                  We may update these Terms of Service from time to time. We will notify users of any material changes by
                  posting the updated terms on our website.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">8. Contact Information</h2>
                <p className="text-gray-300">
                  If you have any questions about these Terms of Service, please contact us at support@tiktokrepostremover.com.
                </p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
}