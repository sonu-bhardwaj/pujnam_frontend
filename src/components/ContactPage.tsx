import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            We Love To Hear From You!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your opinions, suggestions, and questions are valuable to us. Please go ahead, and write to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Get in Touch</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#FF8C00] bg-opacity-10 p-3 rounded-full">
                  <MapPin className="text-[#FF8C00]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Our Address</h3>
                  <p className="text-gray-600">
                    {settings?.storeAddress && `${settings.storeAddress}`}
                    {settings?.storeAddress && (settings?.city || settings?.state) && <br />}
                    {settings?.city && `${settings.city}`}
                    {settings?.city && settings?.state && ', '}
                    {settings?.state && `${settings.state}`}
                    {settings?.pincode && ` - ${settings.pincode}`}
                    {!settings?.storeAddress && !settings?.city && !settings?.state && (
                      <>
                        Pujashree Store, 1st & 2nd Floor<br />
                        Above Patanjali Store, Mandi Kataula Road<br />
                        Mandi, Himachal Pradesh - 175005
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#FF8C00] bg-opacity-10 p-3 rounded-full">
                  <Mail className="text-[#FF8C00]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Email Us</h3>
                  <a href={`mailto:${settings?.storeEmail || 'info@pujnamstore.com'}`} className="text-[#FF8C00] hover:underline">
                    {settings?.storeEmail || 'info@pujnamstore.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#FF8C00] bg-opacity-10 p-3 rounded-full">
                  <Phone className="text-[#FF8C00]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Call Us</h3>
                  <a href={`tel:${settings?.storePhone?.replace(/\s/g, '') || '+919876543210'}`} className="text-[#FF8C00] hover:underline">
                    {settings?.storePhone || '+91 98765 43210'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#FF8C00] bg-opacity-10 p-3 rounded-full">
                  <Clock className="text-[#FF8C00]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Saturday: 10:00 AM - 7:00 PM<br />
                    Sunday: 11:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.8521643932947!2d76.93203731516103!3d31.708377981301796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDQyJzMwLjIiTiA3NsKwNTYnMDcuMiJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] transition-colors resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={20} />
                  Send Message
                </button>

                <p className="text-sm text-gray-500 text-center">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a href="#/privacy" className="text-[#FF8C00] hover:underline">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="#/terms" className="text-[#FF8C00] hover:underline">Terms & Conditions</a>
                  {' '}apply.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
