import React, { useState, useEffect, useRef } from 'react';
import { sectionVideosApi } from '../lib/api';

interface VideoItem {
  id: string;
  video_url: string;
  title?: string;
}

export const VideoSection: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await sectionVideosApi.getAll({ active: true });
      if (error || !data?.videos?.length) return;
      const list = (data.videos as any[])
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((v) => ({
          id: v._id || v.id,
          video_url: v.video_url,
          title: v.title,
        }));
      setVideos(list);
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videos.length]);

  if (videos.length === 0) return null;

  const current = videos[0];

  return (
    <section className="w-full overflow-hidden mt-10">
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: '32/9' }}
      >
        <video
          ref={videoRef}
          key={current.id}
          src={current.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
        />
      </div>
    </section>
  );
};
