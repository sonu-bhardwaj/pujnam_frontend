import React from 'react';
import { ShieldCheck, FileText, RotateCcw, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';

type LegalPageType = 'terms' | 'privacy' | 'refund';

interface LegalPageProps {
  page: LegalPageType;
}

const paragraphize = (content: string) =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export const LegalPage: React.FC<LegalPageProps> = ({ page }) => {
  const { settings } = useSettings();

  const companyName = settings?.legalCompanyName || settings?.storeName || 'Pujnam Store';
  const businessName = settings?.legalBusinessName || settings?.storeName || 'Pujnam Store';
  const websiteUrl = settings?.legalWebsiteUrl || window.location.origin;
  const supportEmail = settings?.legalSupportEmail || settings?.storeEmail || 'support@pujnamstore.com';
  const supportPhone = settings?.legalSupportPhone || settings?.storePhone || '';
  const registeredAddress =
    settings?.legalRegisteredAddress ||
    [settings?.storeAddress, settings?.city, settings?.state, settings?.pincode].filter(Boolean).join(', ');
  const operatingAddress = settings?.legalOperatingAddress || registeredAddress;
  const effectiveDate = settings?.legalEffectiveDate || new Date().toLocaleDateString('en-IN');
  const grievanceOfficerName = settings?.legalGrievanceOfficerName || 'Customer Support Team';
  const grievanceOfficerEmail = settings?.legalGrievanceOfficerEmail || supportEmail;
  const grievanceOfficerPhone = settings?.legalGrievanceOfficerPhone || supportPhone;

  const pageConfig = {
    terms: {
      icon: FileText,
      title: 'Terms & Conditions',
      subtitle: `Please read these terms carefully before using ${businessName}.`,
      accent: 'from-amber-50 via-white to-orange-50',
      sections: [
        {
          title: '1. Acceptance Of Terms',
          content: settings?.termsCustomIntro || `${businessName} is operated by ${companyName}${settings?.legalEntityType ? `, a ${settings.legalEntityType}` : ''}. By using ${websiteUrl}, creating an account, or placing an order, you agree to these Terms & Conditions, our Privacy Policy, and our Refund & Cancellation Policy.`,
        },
        {
          title: '2. Orders, Pricing And Product Availability',
          content: settings?.termsCustomOrders || `All orders are subject to availability, review, and acceptance by ${businessName}. We may cancel or modify orders in case of stock issues, pricing errors, suspected fraud, incorrect customer details, or legal restrictions. Product images and descriptions are presented in good faith and may vary slightly where items are handcrafted or naturally sourced.`,
        },
        {
          title: '3. Website Use And Customer Responsibilities',
          content: settings?.termsCustomUsage || `You agree to provide true and complete information while registering, ordering, and contacting us. You must not misuse this website for unlawful, abusive, fraudulent, infringing, defamatory, or harmful activity, and you must not interfere with platform security, services, or other users.`,
        },
        {
          title: '4. Payments, Liability And Governing Law',
          content: settings?.termsCustomLiability || `Payments are processed through approved providers and remain subject to gateway authorization. ${businessName} is not responsible for delays caused by payment partners, logistics providers, force majeure events, or technical issues beyond reasonable control. Applicable Indian law will govern these terms.`,
        },
      ],
    },
    refund: {
      icon: RotateCcw,
      title: 'Refund & Cancellation Policy',
      subtitle: `Clear guidance on cancellations, replacements, and refund timelines for ${businessName}.`,
      accent: 'from-rose-50 via-white to-orange-50',
      sections: [
        {
          title: '1. Policy Overview',
          content: settings?.refundCustomOverview || `We aim to resolve genuine order concerns fairly and quickly. Refunds, replacements, and cancellations are reviewed based on the order stage, product type, item condition, and supporting proof shared by the customer.`,
        },
        {
          title: '2. Cancellation And Eligibility',
          content: settings?.refundCustomEligibility || `Orders are generally cancellable before dispatch. Once packed, shipped, delivered, personalized, opened, or used, cancellation or refund may not be available. Damaged, defective, incorrect, or missing items should be reported promptly with photos and order details.`,
        },
        {
          title: '3. Refund Process And Timelines',
          content: settings?.refundCustomProcess || `To request support, contact ${supportEmail}${supportPhone ? ` or ${supportPhone}` : ''} with your order number and issue details. Approved refunds are processed to the original payment method or otherwise as agreed, subject to payment-partner timelines.`,
        },
        {
          title: '4. Exceptions And Important Notes',
          content: settings?.refundCustomExceptions || `Convenience fees, COD charges, or shipping fees may be non-refundable unless the issue is attributable to us or required by law. We reserve the right to request additional proof and reject abusive or fraudulent claims.`,
        },
      ],
    },
    privacy: {
      icon: ShieldCheck,
      title: 'Privacy Policy',
      subtitle: `How ${businessName} collects, uses, protects, and manages personal information.`,
      accent: 'from-sky-50 via-white to-cyan-50',
      sections: [
        {
          title: '1. Information We Collect',
          content: settings?.privacyCustomOverview || `${companyName} may collect information such as your name, phone number, email address, delivery address, order details, account details, communications, and technical usage information when you browse, register, order, or contact us.`,
        },
        {
          title: '2. Why We Collect And Use Your Data',
          content: settings?.privacyCustomCollection || `We use data to process orders, provide support, send service updates, improve website performance, prevent fraud, maintain business records, and comply with legal obligations. Promotional communication is sent only where permitted or requested.`,
        },
        {
          title: '3. Sharing, Security And Retention',
          content: settings?.privacyCustomUsage || `Information may be shared only as needed with payment providers, logistics partners, support vendors, or legal authorities. We use reasonable safeguards to protect data, though no system can guarantee absolute security. Data is retained only as long as necessary for operational, legal, and record-keeping purposes.`,
        },
        {
          title: '4. Cookies, Rights And Contact',
          content: settings?.privacyCustomSharing || `This website may use cookies and analytics tools to improve functionality and user experience. For privacy concerns, access or correction requests, or grievance escalation, contact ${grievanceOfficerName} at ${grievanceOfficerEmail}${grievanceOfficerPhone ? ` or ${grievanceOfficerPhone}` : ''}.`,
        },
        {
          title: '5. Your Choices',
          content: settings?.privacyCustomRights || `You may contact us to update account information, unsubscribe from promotional communication, or exercise applicable privacy choices, subject to lawful retention and operational requirements.`,
        },
      ],
    },
  }[page];

  const Icon = pageConfig.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <section className={`bg-gradient-to-br ${pageConfig.accent} py-16`}>
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-6">
              <Icon className="text-[#FF8C00]" size={30} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">{pageConfig.title}</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{pageConfig.subtitle}</p>
            <div className="mt-6 text-sm text-gray-500">
              Effective date: <span className="font-semibold text-[#1A1A1A]">{effectiveDate}</span>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
              <div className="space-y-6">
                {pageConfig.sections.map((section) => (
                  <article key={section.title} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">{section.title}</h2>
                    <div className="space-y-4 text-gray-700 leading-8">
                      {paragraphize(section.content).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <aside className="space-y-6">
                <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="text-[#FF8C00]" size={22} />
                    <h3 className="text-xl font-bold">Company Details</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-200">
                    <p><strong className="text-white">Company:</strong> {companyName}</p>
                    <p><strong className="text-white">Brand:</strong> {businessName}</p>
                    {settings?.legalEntityType && <p><strong className="text-white">Entity Type:</strong> {settings.legalEntityType}</p>}
                    {settings?.legalGstin && <p><strong className="text-white">GSTIN:</strong> {settings.legalGstin}</p>}
                    {settings?.legalCin && <p><strong className="text-white">CIN:</strong> {settings.legalCin}</p>}
                    <p><strong className="text-white">Website:</strong> {websiteUrl}</p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Contact & Grievance</h3>
                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <Mail className="text-[#FF8C00] mt-0.5" size={18} />
                      <div>
                        <p className="font-semibold">Support Email</p>
                        <p>{supportEmail}</p>
                      </div>
                    </div>
                    {supportPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="text-[#FF8C00] mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Support Phone</p>
                          <p>{supportPhone}</p>
                        </div>
                      </div>
                    )}
                    {(registeredAddress || operatingAddress) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="text-[#FF8C00] mt-0.5" size={18} />
                        <div>
                          <p className="font-semibold">Registered / Operating Address</p>
                          <p>{registeredAddress || operatingAddress}</p>
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t border-orange-200">
                      <p className="font-semibold text-[#1A1A1A]">Grievance Officer</p>
                      <p>{grievanceOfficerName}</p>
                      <p>{grievanceOfficerEmail}</p>
                      {grievanceOfficerPhone && <p>{grievanceOfficerPhone}</p>}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
