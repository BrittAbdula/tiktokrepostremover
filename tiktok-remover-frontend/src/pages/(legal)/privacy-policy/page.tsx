
export async function generateMetadata() {
  const canonical = '/privacy-policy';

  return {
      metadataBase: new URL('https://tiktokrepostremover.com'),
      title: {
          absolute: "",
          default: "privacy-policy",
          template: "%s | tiktokrepostremover"
      },
      description: "tiktokrepostremover privacy policy",
      alternates: {
          canonical,
      }
  };
}

export default function PrivacyPolicy() {
    return (
        <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
            <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Data Collection</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    tiktokrepostremover.com attaches great importance to user privacy, we put the user&apos;s feeling and experience in the first place.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    At tiktokrepostremover.com, we collect certain information from our users in order to provide and improve our services.
                    This includes your email address, username, and any messages or content you choose to share with us.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    We may also collect information about your device and how you use our website, such as your IP address,
                    browser type, and operating system. This data helps us understand how our users interact with our platform and
                    allows us to enhance their experience.
                </p>
            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Data Usage</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    We use the information we collect to provide you with our services, such as allowing you to send and receive
                    messages, and to improve and maintain our platform.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    We may also use your data to communicate with you about our services, such as sending you updates or
                    notifications. We will never sell or share your personal information with third parties for their own
                    marketing purposes without your consent.
                </p>
            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Data Security</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    We take the security of your data very seriously. We use industry- standard encryption and other measures to
                    protect your information from unauthorized access, disclosure, or misuse.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    In the event of a data breach, we will notify you and any relevant authorities as required by law.
                </p>
            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Children&apos;s Privacy Protection</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    We are no services available to children under the age of 18(or the age of your country/region), and we do not knowingly collect these informations. Any person under 18 needs the consent of their parents or other guardian to use the products or services of tiktokrepostremover.com.
                </p>
            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Links to other websites</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    tiktokrepostremover.com contains links to other websites and ads. We accept no liability for the privacy policies, security, procedures, products, practices of these third-party websites.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    These third-party websites have thier own contents and privacy policies, if you click on these links, you will point to a third-party website. We strongly recommended you to check the privacy policy of each website you visit.          </p>
            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Your Rights</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    You have the right to access, correct, or delete the personal information we hold about you. You can also
                    request that we limit or stop processing your data, or export your data in a portable format.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    If you have any questions or concerns about our privacy practices, or would like to exercise your rights,
                    please contact us at support@tiktokrepostremover.com.
                </p>

            </section>
            <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Last revised in</h2>
                <p className="text-gray-500 dark:text-gray-400">
                May 14, 2025
                </p>
            </section>
        </main>
    )
}