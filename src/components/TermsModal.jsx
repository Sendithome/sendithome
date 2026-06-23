import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

export default function TermsModal({ open, onClose, type = 'terms' }) {
  const isTerms = type === 'terms';

  const termsContent = [
    {
      heading: '1. Service Overview',
      body: 'Send It Home ("SIH", "we", "us") provides a hotel-based international shipping service that delivers your holiday purchases from your hotel to your home address. By registering an account and using our service, you agree to these Terms & Conditions.',
    },
    {
      heading: '2. Personal Shopping Only',
      body: 'Our service is strictly for personal, non-commercial use. You may only ship items purchased by you for your own personal use. Commercial, resale, or bulk shipments are not permitted. SIH reserves the right to refuse any shipment that appears commercial in nature.',
    },
    {
      heading: '3. Acceptable & Prohibited Items',
      body: 'You may ship clothing, footwear, accessories, souvenirs, gifts, and other personal retail purchases. Prohibited items include but are not limited to: perishables, alcohol, tobacco, firearms, weapons, illegal substances, counterfeit goods, hazardous materials, live animals, and any item restricted by the origin or destination country. It is your responsibility to ensure your items are legal to ship and import into your destination country.',
    },
    {
      heading: '4. Shipping & Delivery',
      body: 'Delivery is handled by our logistics partners (FedEx, DHL, or equivalent). Estimated delivery time is 1–3 working days (Monday–Friday) from collection. SIH is not liable for delays caused by customs inspections, force majeure, or courier delays beyond our control. Tracking is provided so you can monitor your shipment in real time.',
    },
    {
      heading: '5. Fees & Payment',
      body: 'The total shipping fee is US$50 per box, regardless of size (10kg or 20kg). This is split into: US$30 "Transit Protection & Activation" paid online at checkout, and US$20 "Concierge Fulfillment" charged to your hotel bill. All online payments are processed securely via Stripe.',
    },
    {
      heading: '6. Customs & Duties',
      body: 'You are responsible for any customs duties, taxes, or import fees levied by your destination country. SIH generates customs paperwork based on the items and values you declare. You must declare all items accurately and truthfully. SIH is not liable for penalties arising from inaccurate or incomplete declarations.',
    },
    {
      heading: '7. Passport & Identity Verification',
      body: 'You must provide a valid passport number, nationality, and passport expiry date. This information is used solely for international shipping, customs clearance, and identity verification. Providing false or fraudulent identity information is a breach of these Terms and may result in service refusal.',
    },
    {
      heading: '8. Packaging & Handling',
      body: 'Your items are packed and sealed by trained hotel concierge staff. Boxes are stored under CCTV surveillance until collected by the courier. SIH takes reasonable care in handling your items but is not liable for damage to fragile items that were not declared as fragile at drop-off.',
    },
    {
      heading: '9. Liability & Transit Protection',
      body: 'The US$30 Transit Protection fee covers your shipment against loss or total damage during transit, up to the declared value of your items. Claims must be submitted within 14 days of the expected delivery date with supporting evidence (photos, receipts). SIH is not liable for consequential or indirect losses.',
    },
    {
      heading: '10. Account & Security',
      body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.',
    },
    {
      heading: '11. Cancellations & Refunds',
      body: 'You may cancel your shipment free of charge before the box has been collected by the courier. Once collected, cancellations are not possible, but Transit Protection claims may be filed per section 9. Refunds for the US$30 online fee, if applicable, will be processed back to your original payment method.',
    },
    {
      heading: '12. Acceptable Use',
      body: 'You agree not to use the service for any unlawful purpose, not to submit false or misleading information, and not to attempt to disrupt or compromise the platform\u2019s security.',
    },
    {
      heading: '13. Changes to These Terms',
      body: 'SIH may update these Terms from time to time. The latest version will always be available within the app. Continued use of the service after changes constitutes acceptance of the revised Terms.',
    },
    {
      heading: '14. Governing Law',
      body: 'These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.',
    },
  ];

  const privacyContent = [
    {
      heading: '1. Introduction',
      body: 'Send It Home ("SIH", "we", "us") is committed to protecting your personal data. This Privacy Policy explains what data we collect, why we collect it, how we store it, and your rights regarding your information.',
    },
    {
      heading: '2. Data We Collect',
      body: 'We collect the following personal data to provide our shipping service:\n\n• Full name (first, middle, last)\n• Nationality\n• Passport number and expiry date\n• Email address\n• Phone number and WhatsApp number\n• Home delivery address (address, city, postal code, country)\n• Hotel name, room, city, and country (during your stay)\n• Purchased item details (description, category, value, receipts)',
    },
    {
      heading: '3. Why We Collect Your Data',
      body: 'Your data is collected for the following lawful purposes:\n\n• International shipping and logistics (delivering your items home)\n• Customs clearance (generating declarations, invoices, and packing lists)\n• Identity verification (matching your passport to your shipment)\n• Order tracking and status notifications\n• Customer support and dispute resolution\n• Fraud prevention and legal compliance',
    },
    {
      heading: '4. Passport Data — Special Protection',
      body: 'Passport details are classified as sensitive personal data and are required solely for international shipping and customs clearance. They are:\n\n• Encrypted in transit and at rest\n• Accessible only to authorized personnel involved in customs processing\n• Never sold, shared with marketers, or used for advertising\n• Retained only for the duration required by customs and tax regulations, then permanently deleted',
    },
    {
      heading: '5. Data Storage & Security',
      body: 'Your data is stored on secure cloud infrastructure with industry-standard encryption (TLS 1.2+ in transit, AES-256 at rest). Access is restricted to authorized SIH personnel and logistics partners who require it to fulfill your shipment. We conduct regular security reviews to safeguard your information.',
    },
    {
      heading: '6. Data Sharing',
      body: 'We share your data only with parties necessary to complete your shipment:\n\n• Logistics partners (FedEx, DHL) — for shipping and tracking\n• Customs authorities — for clearance and declarations\n• Payment processor (Stripe) — for secure payment (we never see or store your card details)\n• Hotel concierge teams — for item collection and packaging\n\nWe never sell your data to third parties for marketing or commercial purposes.',
    },
    {
      heading: '7. Data Retention',
      body: 'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, including any legal, accounting, or regulatory requirements. Customs-related records are retained per the laws of the origin and destination countries. Once no longer required, your data is permanently and securely deleted.',
    },
    {
      heading: '8. Your Rights',
      body: 'You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data (subject to legal retention requirements)\n• Object to or restrict certain processing of your data\n• Withdraw consent for marketing communications (if any)\n\nTo exercise any of these rights, contact us at privacy@sendithome.com.',
    },
    {
      heading: '9. Cookies & Analytics',
      body: 'Our platform uses minimal cookies and analytics to improve service quality and user experience. We do not use tracking cookies for third-party advertising.',
    },
    {
      heading: '10. International Transfers',
      body: 'As an international shipping service, your data may be transferred to and processed in countries other than your country of residence. We ensure such transfers comply with applicable data protection laws and that appropriate safeguards are in place.',
    },
    {
      heading: '11. Children\u2019s Privacy',
      body: 'Our service is not available to individuals under 18. We do not knowingly collect data from minors.',
    },
    {
      heading: '12. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. The latest version will always be available within the app. We will notify you of any significant changes that affect your rights.',
    },
    {
      heading: '13. Contact Us',
      body: 'If you have any questions about this Privacy Policy or how your data is handled, please contact us at privacy@sendithome.com.',
    },
  ];

  const content = isTerms ? termsContent : privacyContent;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-6 sm:px-8 sm:py-8">
              <h1 className="text-2xl font-black text-accent mb-1">
                {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">Last updated: June 2026</p>

              <div className="space-y-5">
                {content.map((section, idx) => (
                  <div key={idx}>
                    <h2 className="text-base font-bold text-foreground mb-1.5">{section.heading}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}