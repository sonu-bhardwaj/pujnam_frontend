import React, { useState, useEffect } from 'react';
import { promoBlocksApi } from '../lib/api';
import { getPlaceholderImage } from '../lib/placeholders';
import { Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const IMAGE_NOT_AVAILABLE = getPlaceholderImage(600, 400, 'Image not available');

interface PromoBlock {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  button_text: string;
  link_url: string;
}

export const PromoBlocksSection: React.FC = () => {
  const [blocks, setBlocks] = useState<PromoBlock[]>([]);
  const { settings } = useSettings();

  const toDialerHref = (value?: string) => {
    const raw = String(value || '').trim();
    const fromStore = String(settings?.storePhone || '').trim();
    const source = raw || fromStore;
    if (!source) return '#';

    if (source.toLowerCase().startsWith('tel:')) return source;

    const digits = source.replace(/[^\d+]/g, '');
    if (digits) {
      return digits.startsWith('+') ? `tel:${digits}` : `tel:+${digits}`;
    }

    return '#';
  };

  const resolveButtonHref = (block: PromoBlock) => {
    const buttonText = String(block.button_text || '').trim().toLowerCase();
    if (buttonText.includes('call')) {
      return toDialerHref(block.link_url);
    }
    return block.link_url || '#';
  };

  useEffect(() => {
    const fetchBlocks = async () => {
      const { data, error } = await promoBlocksApi.getAll({ active: true });
      if (error) return;
      const list = (data?.blocks || [])
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .slice(0, 2)
        .map((b: any) => ({
          id: b._id || b.id,
          title: b.title,
          description: b.description,
          image_url: b.image_url || IMAGE_NOT_AVAILABLE,
          button_text: b.button_text || 'Call Now',
          link_url: b.link_url || '#',
        }));
      setBlocks(list);
    };
    fetchBlocks();
  }, []);

  if (blocks.length === 0) return null;

  return (
    <section className="py-6 md:py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-[#FF8C00]/30 flex flex-col"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={block.image_url}
                  alt={block.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = IMAGE_NOT_AVAILABLE;
                  }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-base md:text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF8C00] mb-1 font-serif transition-colors duration-300">
                  {block.title}
                </h3>
                {block.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{block.description}</p>
                )}
                {(() => {
                  const href = resolveButtonHref(block);
                  const isExternal = href.startsWith('http');
                  return (
                <a
                  href={href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#FF8C00] text-white py-2 px-4 rounded-lg hover:bg-[#ff9f1a] hover:shadow-md hover:scale-105 transition-all duration-300 w-fit"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  <Phone size={16} />
                  {block.button_text}
                </a>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
