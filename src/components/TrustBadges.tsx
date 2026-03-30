import React from 'react';
import { Leaf, Award, Shield, Users } from 'lucide-react';

const badges = [
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Sustainable and natural ingredients',
  },
  {
    icon: Award,
    title: 'Authentic & Pure',
    description: 'Certified and temple-approved',
  },
  {
    icon: Users,
    title: 'Devotees Trust',
    description: 'Trusted by thousands of devotees',
  },
  {
    icon: Shield,
    title: 'No Chemicals',
    description: 'Pure and traditional methods',
  },
  {
    icon: Award,
    title: 'Divine Quality',
    description: 'Premium quality products',
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-12">
          Our <span className="text-gradient">Promise to You</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-50 to-white rounded-full shadow-md mb-4 group-hover:shadow-primary transition-all duration-300 group-hover:scale-110">
                <badge.icon className="text-[#FF8C00] transition-transform duration-300" size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#FF8C00] transition-colors">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
