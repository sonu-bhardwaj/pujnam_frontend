import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Orders & Shipping',
    question: 'How long does shipping take?',
    answer: 'We offer free shipping on orders above â‚¹499. Standard delivery takes 5-7 business days. For orders below â‚¹499, a shipping fee of â‚¹50 applies.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within India. We are working on expanding our services internationally soon.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Can I track my order?',
    answer: 'Yes, once your order is shipped, you will receive a tracking number via email and SMS. You can use this to track your order in real-time.'
  },
  {
    category: 'Products',
    question: 'Are all your products authentic?',
    answer: 'Yes, all our puja items are 100% authentic and sourced from trusted suppliers. We ensure the highest quality and authenticity for all our products.'
  },
  {
    category: 'Products',
    question: 'What if I receive a damaged product?',
    answer: 'If you receive a damaged or defective product, please contact us within 48 hours with photos. We will arrange for a replacement or refund immediately.'
  },
  {
    category: 'Products',
    question: 'Do you offer product bundles?',
    answer: 'Yes, we offer special combo packs and bundles at discounted prices. Check our Puja Special section for exclusive combo offers.'
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit/debit cards, net banking, and cash on delivery (COD). All payments are secure and encrypted.'
  },
  {
    category: 'Payment',
    question: 'Is it safe to use my card on your website?',
    answer: 'Absolutely. We use industry-standard encryption and secure payment gateways to protect your financial information.'
  },
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for unused and unopened products. Please contact our customer support to initiate a return.'
  },
  {
    category: 'Returns & Refunds',
    question: 'How long does it take to process refunds?',
    answer: 'Refunds are processed within 5-7 business days after we receive the returned product. The amount will be credited to your original payment method.'
  },
  {
    category: 'Account',
    question: 'Do I need to create an account to place an order?',
    answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and get exclusive offers.'
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click on the login icon, then select "Forgot Password". Enter your registered phone number or email, and you will receive an OTP to reset your password.'
  }
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];
  const filteredFAQs = selectedCategory === 'All'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, orders, and services
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-[#FF8C00] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#FF8C00] mb-2 block">
                    {faq.category}
                  </span>
                  <h3 className="font-semibold text-[#1A1A1A] text-lg">
                    {faq.question}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-[#FF8C00] flex-shrink-0 ml-4" size={24} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-50 to-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our customer support team is here to help you
          </p>
          <a
            href="#/contact"
            className="btn-primary inline-block"
          >
            Contact Us
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};
