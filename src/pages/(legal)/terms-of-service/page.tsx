
export async function generateMetadata() {
  const canonical = '/terms-of-service';

  return {
      metadataBase: new URL('https://tiktokrepostremover.com'),
      title: {
          absolute: "",
          default: "terms-of-service",
          template: "%s | tiktokrepostremover"
      },
      description: "tiktokrepostremover terms of service",
      alternates: {
          canonical,
      }
  };
}

export default function TermsOfService() {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Effective Date: May 14, 2025</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Definitions</h2>
            <p>In these Terms of Service, the following definitions apply:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-500 dark:text-gray-400">
              <li>
                <strong>tiktokrepostremover</strong>: The website and platform operated by tiktokrepostremover Inc.
              </li>
              <li>
                <strong>Service</strong>: The tiktokrepostremover platform and all related services provided by tiktokrepostremover Inc.
              </li>
              <li>
                <strong>User</strong>: Any individual or entity that accesses or uses the Service.
              </li>
              <li>
                <strong>Content</strong>: All text, images, videos, audio, or other materials uploaded, submitted, or
                displayed on the Service.
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. User Accounts</h2>
            <p>
              To use the Service, you must create an account. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree to provide accurate and complete information when creating your account and to update this
              information as necessary to keep it current.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Intellectual Property</h2>
            <p>
              The Service, including its content, features, and functionality, is owned by tiktokrepostremover Inc. and is protected by
              copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not modify, copy, distribute, transmit, display, reproduce, or create derivative works from the
              Service without our prior written consent.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Prohibited Conduct</h2>
            <p>You agree not to engage in any of the following prohibited conduct while using the Service:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-500 dark:text-gray-400">
              <li>
                Violating any applicable law or regulation, including but not limited to copyright, trademark, or other
                intellectual property laws.
              </li>
              <li>
                Uploading, posting, or transmitting any Content that is unlawful, harmful, threatening, abusive,
                harassing, defamatory, vulgar, obscene, or invasive of another&apos;ss privacy.
              </li>
              <li>
                Impersonating any person or entity, or falsely stating or misrepresenting your affiliation with a person
                or entity.
              </li>
              <li>Interfering with or disrupting the Service or its servers and networks.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, for any reason,
              including if we reasonably believe that you have violated these Terms of Service.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease, and we may delete or remove any
              Content associated with your account.
            </p>
          </div>
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Disclaimers</h2>
            <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or
                implied. tiktokrepostremover Inc. does not warrant that the Service will be uninterrupted or error-free, or that defects
                will be corrected.
            </p>
            <p>
                tiktokrepostremover Inc. disclaims all warranties, including but not limited to warranties of merchantability, fitness for
                a particular purpose, and non-infringement.
            </p>
        </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
            <p>
              In no event shall tiktokrepostremover Inc. be liable for any indirect, special, incidental, or consequential damages
              arising out of or in connection with the Service, including but not limited to lost profits, business
              interruption, or loss of data.
            </p>
            <p>tiktokrepostremover Inc.&apos;ss total liability to you for any and all claims shall not exceed $100.</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold tiktokrepostremover Inc., its affiliates, officers, agents, and employees harmless from any
              claim or demand, including reasonable attorneys&apos;s fees, made by any third party due to or arising out of your
              use of the Service, your violation of these Terms of Service, or your violation of any rights of another.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Governing Law</h2>
            <p>
              These Terms of Service and your use of the Service shall be governed by and construed in accordance with the
              laws of the State of California, without giving effect to any principles of conflicts of law.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">10. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Service or the Service, please contact us at:
            </p>
            <p>
              Email: support@tiktokrepostremover.com
            </p>
          </div>
        </div>
      </main>
    )
  }