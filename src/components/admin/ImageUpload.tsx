import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  label = 'Image',
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', files[0]);
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/upload/${multiple ? 'images' : 'image'}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (multiple) {
        const existingUrls = Array.isArray(value) ? value : [];
        onChange([...existingUrls, ...data.urls]);
      } else {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeImage = (index?: number) => {
    if (multiple && Array.isArray(value)) {
      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  const currentValue = multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? value : '');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-300 bg-gray-50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#FF8C00] hover:bg-orange-50'}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="text-[#FF8C00] font-semibold">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>

      {/* Image Preview(s) */}
      {multiple && Array.isArray(currentValue) && currentValue.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {currentValue.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!multiple && typeof currentValue === 'string' && currentValue && (
        <div className="relative group mt-4 inline-block">
          <img
            src={currentValue}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => removeImage()}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* URL Input Fallback */}
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Or enter image URL:</p>
        {multiple ? (
          <textarea
            value={Array.isArray(currentValue) ? currentValue.join('\n') : ''}
            onChange={(e) => {
              const urls = e.target.value.split('\n').filter(Boolean);
              onChange(urls);
            }}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
          />
        ) : (
          <input
            type="url"
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
          />
        )}
      </div>
    </div>
  );
};
