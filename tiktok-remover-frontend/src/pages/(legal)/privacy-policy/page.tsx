import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
      <>
        <Helmet>
          <title>Privacy Policy | ClearTok - TikTok Repost Remover</title>
          <meta name="description" content="Learn how ClearTok protects your privacy. Our TikTok repost remover operates locally in your browser and never stores your personal data." />
          <link rel="canonical" href="https://tiktokrepostremover.com/privacy-policy" />
          
          <meta property="og:title" content="Privacy Policy | ClearTok - TikTok Repost Remover" />
          <meta property="og:description" content="Learn how ClearTok protects your privacy. Our TikTok repost remover operates locally in your browser." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://tiktokrepostremover.com/privacy-policy" />
          <meta property="og:image" content="https://tiktokrepostremover.com/logo.png" />
          
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Privacy Policy | ClearTok - TikTok Repost Remover" />
          <meta name="twitter:description" content="Learn how ClearTok protects your privacy. Our TikTok repost remover operates locally in your browser." />
          <meta name="twitter:image" content="https://tiktokrepostremover.com/logo.png" />
        </Helmet>
        
        <div className="min-h-screen bg-black">
          <Header />
          <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
              <h1 className="mb-8 text-4xl font-bold text-white">Privacy Policy</h1>
              
              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Our Privacy Commitment</h2>
                  <p className="text-gray-300 mb-4">
                      ClearTok.com is committed to protecting your privacy. We believe in transparency and user control over data.
                      This Privacy Policy explains how our TikTok repost remover extension handles information.
                  </p>
                  <p className="text-gray-300">
                      <strong className="text-white">Key Point:</strong> ClearTok operates entirely within your browser. 
                      We do not store your TikTok credentials, personal data, or video information on our servers.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Data We Do NOT Collect</h2>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li>Your TikTok email or password</li>
                      <li>Your TikTok videos or reposts</li>
                      <li>Personal information from your TikTok profile</li>
                      <li>Your browsing history outside of our extension</li>
                      <li>Any content from your TikTok account</li>
                  </ul>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">How Our Extension Works</h2>
                  <p className="text-gray-300 mb-4">
                      ClearTok operates by automating the same actions you could perform manually on TikTok.com:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li>Accessing your public TikTok profile (which you're already logged into)</li>
                      <li>Finding reposted videos using TikTok's public interface</li>
                      <li>Sending delete requests directly to TikTok's servers</li>
                      <li>All processing happens locally in your browser session</li>
                  </ul>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Website Analytics</h2>
                  <p className="text-gray-300 mb-4">
                      Our website (tiktokrepostremover.com) uses Google Analytics to understand how visitors use our site. 
                      This helps us improve our service and user experience.
                  </p>
                  <p className="text-gray-300">
                      Google Analytics may collect:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li>Page views and session duration</li>
                      <li>Device and browser information</li>
                      <li>General geographic location (country/region level)</li>
                      <li>Referring websites</li>
                  </ul>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Chrome Extension Permissions</h2>
                  <p className="text-gray-300 mb-4">
                      Our Chrome extension requires minimal permissions to function:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li><strong className="text-white">Access to tiktok.com:</strong> Required to interact with your TikTok profile and perform deletions</li>
                      <li><strong className="text-white">Storage:</strong> Used only to save your extension preferences locally in your browser</li>
                  </ul>
                  <p className="text-gray-300">
                      These permissions are used solely for the extension's core functionality and nothing else.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Data Security</h2>
                  <p className="text-gray-300 mb-4">
                      Since we don't collect or store your personal data, there's no central database that could be compromised. 
                      Your data remains secure because it stays with you.
                  </p>
                  <p className="text-gray-300">
                      Our extension communicates directly with TikTok's servers using your existing logged-in session, 
                      maintaining the same security standards as when you use TikTok normally.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Third-Party Services</h2>
                  <p className="text-gray-300 mb-4">
                      We use the following third-party services:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li><strong className="text-white">Google Analytics:</strong> For website usage statistics</li>
                      <li><strong className="text-white">Chrome Web Store:</strong> For extension distribution</li>
                      <li><strong className="text-white">GitHub:</strong> For open-source code hosting</li>
                  </ul>
                  <p className="text-gray-300">
                      Each service has its own privacy policy, which we recommend reviewing.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Your Rights</h2>
                  <p className="text-gray-300 mb-4">
                      Since we don't store your personal data, most traditional data rights don't apply. However:
                  </p>
                  <ul className="list-disc space-y-2 pl-6 text-gray-300">
                      <li>You can uninstall our extension at any time</li>
                      <li>You can clear your browser's local storage to remove any extension preferences</li>
                      <li>You can opt out of website analytics using browser settings or privacy extensions</li>
                  </ul>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Children's Privacy</h2>
                  <p className="text-gray-300">
                      Our service is not directed at children under 13. We do not knowingly collect personal information 
                      from children under 13. If you're under 13, please do not use our service.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Changes to This Policy</h2>
                  <p className="text-gray-300">
                      We may update this Privacy Policy from time to time. Any changes will be posted on this page 
                      with an updated revision date. We encourage you to review this policy periodically.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Contact Us</h2>
                  <p className="text-gray-300">
                      If you have any questions about this Privacy Policy or our privacy practices, 
                      please contact us at support@tiktokrepostremover.com.
                  </p>
              </section>

              <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white">Last Updated</h2>
                  <p className="text-gray-300">
                      This Privacy Policy was last updated on May 14, 2025.
                  </p>
              </section>
          </main>
          <Footer />
        </div>
      </>
    );
}