import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Video, Info, Upload, Loader2 } from 'lucide-react';
import { sectionVideosApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface SectionVideo {
  _id: string;
  title?: string;
  video_url: string;
  display_order: number;
  is_active: boolean;
}

export const AdminSectionVideos: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [videos, setVideos] = useState<SectionVideo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<SectionVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    display_order: 0,
    is_active: true,
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await sectionVideosApi.getAll();
    if (error) {
      console.error('Failed to load videos', error);
      return;
    }
    setVideos(data?.videos || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        const { error } = await sectionVideosApi.update(editingVideo._id, formData);
        if (error) {
          showError('Failed to update: ' + error);
          return;
        }
        showSuccess('Video updated!');
      } else {
        const { error } = await sectionVideosApi.create(formData);
        if (error) {
          showError('Failed to add: ' + error);
          return;
        }
        showSuccess('Video added!');
      }
      setIsModalOpen(false);
      setEditingVideo(null);
      resetForm();
      fetchVideos();
    } catch (err) {
      console.error('Error saving video', err);
    }
  };

  const handleEdit = (video: SectionVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      video_url: video.video_url,
      display_order: video.display_order ?? 0,
      is_active: video.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video from the section?')) return;
    const { error } = await sectionVideosApi.delete(id);
    if (error) {
      showError('Failed to delete: ' + error);
      return;
    }
    showSuccess('Video removed!');
    fetchVideos();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      video_url: '',
      display_order: 0,
      is_active: true,
    });
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showError('Please select a video file (e.g. MP4, WebM).');
      return;
    }
    setUploadingVideo(true);
    try {
      const form = new FormData();
      form.append('video', file);
      const response = await fetch(`${API_BASE_URL}/upload/video`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setFormData((prev) => ({ ...prev, video_url: data.url }));
      showSuccess('Video uploaded to Cloudinary. Save the form to add it.');
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch (err) {
      showError('Failed to upload video: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Video Section</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingVideo(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Video
        </button>
      </div>

      <p className="text-gray-600">
        Videos appear full-width on the homepage and auto-play in sequence. Order is by display order (lower = first).
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Video URL</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {videos.map((video) => (
              <tr key={video._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Video className="text-[#FF8C00]" size={20} />
                </td>
                <td className="px-6 py-4 font-medium text-[#1A1A1A]">{video.title || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{video.video_url}</td>
                <td className="px-6 py-4 text-gray-600">{video.display_order}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      video.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(video)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                {editingVideo ? 'Edit Video' : 'Add Video'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Welcome video"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video *</label>
                <div className="mb-2 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Upload</strong> a video (saved to Cloudinary) or <strong>paste a direct URL</strong> below. Section is full-width, auto-plays muted. Max upload size: 100MB. Recommended: wide aspect (21:9).
                  </span>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="mb-3 w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF8C00] hover:bg-orange-50/50 transition-colors text-gray-600 hover:text-[#FF8C00] disabled:opacity-50"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading to Cloudinary…
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload video from device
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mb-2">Or paste video URL:</p>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  required
                  placeholder="https://example.com/video.mp4 or from Cloudinary above"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = first, 1 = second, etc.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Active</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                    />
                    <span className="text-sm text-gray-700">Show on website</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingVideo ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingVideo(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
