import React from 'react';
import { Calendar, Film, Award, Heart, Target, Shield } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export const AboutPage: React.FC = () => {
  React.useEffect(() => {
    // Handle hash navigation to scroll to sections
    const scrollToSection = () => {
      // Get hash from URL (could be #/about#section or just #section)
      const hash = window.location.hash;
      let elementId = '';
      
      if (hash.includes('#')) {
        // Handle format like #/about#our-story
        const parts = hash.split('#');
        elementId = parts[parts.length - 1]; // Get the last part after #
      }
      
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    };

    // Check hash on mount
    scrollToSection();

    // Listen for hash changes
    const handleHashChange = () => {
      scrollToSection();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-6">
              About <span className="text-[#FF8C00]">Pujnam Store</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted companion in faith, providing authentic spiritual products and sacred puja items with devotion and care.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="our-story" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Heart className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Our Story</h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-lg leading-relaxed">
                  Pujnam Store was born from a deep-rooted passion for preserving and sharing the rich spiritual heritage of India. 
                  We understand that every puja ritual is a sacred moment, a connection between the divine and the devotee.
                </p>
                <p className="text-lg leading-relaxed">
                  Our journey began with a simple yet profound mission: to make authentic, pure, and blessed spiritual products 
                  accessible to every household. We source our products directly from traditional artisans and trusted suppliers 
                  who share our commitment to quality and authenticity.
                </p>
                <p className="text-lg leading-relaxed">
                  Every product in our store is carefully curated, ensuring it meets the highest standards of purity and authenticity. 
                  We believe that when you perform puja with genuine products, the spiritual experience becomes more meaningful and fulfilling.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, Pujnam Store serves thousands of families across India, helping them celebrate their faith with products 
                  that are not just items, but carriers of blessings and positive energy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Management Team Section */}
        {/* <section id="management-team" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Users className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Management Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Meet the dedicated team behind Pujnam Store, committed to serving you with devotion and excellence.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: 'Shri Ram Kumar', role: 'Founder & CEO', description: 'Visionary leader with 20+ years of experience in spiritual retail' },
                { name: 'Smt. Priya Sharma', role: 'Head of Operations', description: 'Ensures quality and authenticity of every product' },
                { name: 'Shri Devendra Singh', role: 'Head of Customer Care', description: 'Dedicated to providing exceptional service to our customers' },
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="text-[#FF8C00]" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{member.name}</h3>
                  <p className="text-[#FF8C00] font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Our Presence Section */}
        {/* <section id="our-presence" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <MapPin className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Our Presence</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Serving customers across India with our online platform and physical stores.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Online Store</h3>
                <p className="text-gray-700 mb-4">
                  Our online platform serves customers across India, delivering authentic spiritual products 
                  right to your doorstep with care and devotion.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF8C00]">✓</span>
                    Pan-India delivery
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF8C00]">✓</span>
                    Secure online payments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#FF8C00]">✓</span>
                    24/7 customer support
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Physical Stores</h3>
                <p className="text-gray-700 mb-4">
                  Visit our physical stores to experience our products in person and get personalized guidance 
                  from our knowledgeable staff.
                </p>
                {settings?.storeAddress && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="font-semibold text-[#1A1A1A] mb-2">Store Location:</p>
                    <p className="text-gray-700 text-sm">
                      {settings.storeAddress}
                      {settings.city && `, ${settings.city}`}
                      {settings.state && `, ${settings.state}`}
                      {settings.pincode && ` - ${settings.pincode}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section> */}

        {/* Events Section */}
        <section id="events" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Calendar className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Events & Festivals</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join us in celebrating festivals and special occasions with special offers and curated collections.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { title: 'Diwali Special', description: 'Exclusive puja kits and diyas for the festival of lights', date: 'October-November' },
                { title: 'Navratri Collection', description: 'Special items for nine nights of devotion', date: 'March & October' },
                { title: 'Holi Puja Items', description: 'Colorful and vibrant puja essentials', date: 'March' },
              ].map((event, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="text-[#FF8C00]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  <p className="text-sm text-[#FF8C00] font-semibold">{event.date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section id="media" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Film className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Media & Press</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay updated with our latest news, features, and media coverage.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Featured in Spiritual Times', date: 'January 2026', description: 'How Pujnam Store is revolutionizing spiritual retail' },
                  { title: 'Interview with Founder', date: 'December 2025', description: 'The journey of bringing authentic puja products online' },
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Film className="text-[#FF8C00]" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Target className="w-16 h-16 text-[#FF8C00] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Heart, title: 'Authenticity', description: '100% genuine and traditional products' },
                { icon: Shield, title: 'Purity', description: 'Pure, natural, and blessed items' },
                { icon: Award, title: 'Quality', description: 'Highest standards in every product' },
                { icon: Target, title: 'Devotion', description: 'Serving with love and dedication' },
              ].map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-[#FF8C00]" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
