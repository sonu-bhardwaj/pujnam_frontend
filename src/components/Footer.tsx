import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  return (
    <>
      {/* CTA Section Above Footer */}
      <section className="bg-gradient-to-br from-[#1A1A1A] via-[#2D1B4E] to-[#1A1A1A] text-white py-16">
      <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Begin Your Spiritual Journey?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover authentic puja items and sacred products. Let's transform your spiritual practice with quality products delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#/contact"
                className="group px-8 py-4 bg-white text-[#1A1A1A] rounded-lg font-semibold flex items-center gap-2 hover:bg-[#FF8C00] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-white"
              >
                <Mail className="w-5 h-5" />
                Contact Us Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#/products"
                className="px-8 py-4 bg-transparent text-white rounded-lg font-semibold flex items-center gap-2 border-2 border-white/30 hover:border-[#FF8C00] hover:bg-[#FF8C00]/10 transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Explore Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] text-white pt-16 pb-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF8C00] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {settings?.logo && (
                <div className="relative">
                <img
                  src={settings.logo}
                  alt={settings.storeName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF8C00]/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C00] rounded-full border-2 border-[#1A1A1A]"></div>
                </div>
              )}
              {!settings?.logo && (
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] flex items-center justify-center ring-2 ring-[#FF8C00]/50">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C00] rounded-full border-2 border-[#1A1A1A] animate-pulse"></div>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {settings?.storeName?.split(' ')[0] || 'Pujnam'}
                  <span className="text-[#FF8C00]">{settings?.storeName?.split(' ').slice(1).join(' ') || 'Store'}</span>
              </h3>
                <p className="text-xs text-gray-500 mt-0.5">{settings?.tagline || 'AAPKI AASTHA KA SAARTHI'}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering your spiritual journey with authentic puja items and sacred products. From traditional rituals to modern devotion, we drive growth through quality and trust.
            </p>
            <div className="flex gap-3">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-white/10 hover:border-blue-500/50"
                >
                  <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50 border border-white/10 hover:border-pink-500/50"
                >
                  <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-white/10 hover:border-blue-400/50"
                >
                  <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF8C00] to-transparent"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#/about" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </a>
              </li>
              <li>
                <a href="#/products" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">All Products</span>
                </a>
              </li>
              <li>
                <a href="#/" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </a>
              </li>
              <li>
                <a href="#/about#events" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Events & Media</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              Customer Care
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF8C00] to-transparent"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#/terms" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Terms & Conditions</span>
                </a>
              </li>
              <li>
                <a href="#/refund-cancellation" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Refund & Cancellation</span>
                </a>
              </li>
              <li>
                <a href="#/privacy" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#/contact" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF8C00] to-transparent"></span>
            </h4>
            <ul className="space-y-4">
              {settings?.storeEmail && (
                <li className="flex items-start gap-3 text-gray-400 group">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-lg group-hover:bg-[#FF8C00]/20 transition-colors">
                    <Mail className="text-[#FF8C00] flex-shrink-0 group-hover:scale-110 transition-transform" size={18} />
                  </div>
                  <a href={`mailto:${settings.storeEmail}`} className="hover:text-[#FF8C00] transition-colors break-all">
                    {settings.storeEmail}
                  </a>
                </li>
              )}
              {(settings?.storeAddress || settings?.city || settings?.state) && (
                <li className="flex items-start gap-3 text-gray-400 group">
                  <div className="mt-0.5 p-2 bg-white/5 rounded-lg group-hover:bg-[#FF8C00]/20 transition-colors">
                    <MapPin className="text-[#FF8C00] flex-shrink-0 group-hover:scale-110 transition-transform" size={18} />
                  </div>
                  <span className="leading-relaxed">
                    {settings.storeAddress && `${settings.storeAddress}, `}
                    {settings.city && `${settings.city}, `}
                    {settings.state && `${settings.state}`}
                    {settings.pincode && ` - ${settings.pincode}`}
                  </span>
                </li>
              )}
              {settings?.storePhone && (
                <li className="flex items-center gap-3 text-gray-400 group">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FF8C00]/20 transition-colors">
                    <Phone className="text-[#FF8C00] flex-shrink-0 group-hover:scale-110 transition-transform" size={18} />
                  </div>
                  <a href={`tel:${settings.storePhone.replace(/\s/g, '')}`} className="hover:text-[#FF8C00] transition-colors">
                    {settings.storePhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} <span className="text-[#FF8C00] font-semibold">{settings?.storeName || 'Pujnam Store'}</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
              <a href="#/privacy" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 relative group">
              Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF8C00] group-hover:w-full transition-all duration-300"></span>
            </a>
              <a href="#/terms" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 relative group">
              Terms & Conditions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF8C00] group-hover:w-full transition-all duration-300"></span>
            </a>
              <a href="#/refund-cancellation" className="text-gray-400 hover:text-[#FF8C00] transition-all duration-300 relative group">
              Refund & Cancellation
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF8C00] group-hover:w-full transition-all duration-300"></span>
            </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};
