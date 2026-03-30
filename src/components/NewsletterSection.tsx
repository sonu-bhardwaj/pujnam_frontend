import React, { useState } from 'react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend newsletter API
    setEmail('');
  };

  return (
    <section className="py-8 bg-[#8B4513]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white text-lg md:text-xl">
            Sign up for latest news, events <span className="text-orange-300">and offers</span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-1 max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email@email.com"
              required
              className="flex-1 px-4 py-2 rounded-lg border-2 border-transparent focus:outline-none focus:border-[#FF8C00] text-[#1A1A1A]"
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2A2A2A] transition-colors whitespace-nowrap"
            >
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
