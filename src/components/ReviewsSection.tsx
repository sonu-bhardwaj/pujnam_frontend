import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: '1',
    customerName: 'Simran Dhiraj Tolani',
    productName: 'Laxmi Shankh',
    rating: 5,
    comment: 'Very beautiful and lovely shankh. I have done the same how it was written on ur website and offered to Maa Laxmi',
    date: '01/13/2026',
  },
  {
    id: '2',
    customerName: 'Versha Tyagi',
    productName: 'Dainik Puja Kit',
    rating: 5,
    comment: 'This Pooja Kit simplified my daily pooja process, just open the box and start. I sent this as a gift to my mumma.',
    date: '09/10/2025',
  },
  {
    id: '3',
    customerName: 'Arun',
    productName: 'Rajmohini',
    rating: 5,
    comment: 'Truly amazing product. I can feel the positivity around me and be more confident starting my day. I would recommend this for everyone.',
    date: '09/09/2025',
  },
  {
    id: '4',
    customerName: 'Vinay Lal Verma',
    productName: 'Kuber Potli',
    rating: 5,
    comment: 'I ordered this for my home temple, it\'s nice packaging and included everything that i want. 😃 must go for it 👍🏻',
    date: '09/09/2025',
  },
  {
    id: '5',
    customerName: 'Bhim Singh',
    productName: 'Natural Forest Honey',
    rating: 5,
    comment: 'Soothing Fragrance, Great Quality. I recently purchased Incense Sticks and am Happy with their scent and performance',
    date: '06/29/2023',
  },
  {
    id: '6',
    customerName: 'Sumit',
    productName: 'Dainik Puja Kit',
    rating: 5,
    comment: 'All daily pooja needs in one box. I recently purchased Kit and am Happy with their kit praparation, days wise specialally vidhi part',
    date: '06/29/2023',
  },
];

export const ReviewsSection: React.FC = () => {
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
            Let customers <span className="text-gradient">speak for us</span>
          </h2>
          <p className="text-gray-600">from {reviews.length} reviews</p>
        </div>

        <div className="reviews-marquee">
          <div className="reviews-marquee-track">
            {marqueeReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-[320px] md:w-[360px] flex-shrink-0 bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= review.rating
                          ? 'fill-[#FF8C00] text-[#FF8C00]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-[#1A1A1A] text-sm">{review.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">{review.productName}</p>
                  <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
