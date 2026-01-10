
import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => (f as File).type?.startsWith('image/')) as File[];
    if (files.length > 0) onUpload(files);
  }, [onUpload]);

  return (
    <div className="w-full max-w-2xl">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 bg-slate-900/50'}
        `}
      >
        <div className="mb-6 p-6 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
          <Upload className="w-12 h-12 text-slate-400 group-hover:text-indigo-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-200 mb-2">上传图片</h2>
        <p className="text-slate-400 text-center mb-6 max-w-xs">
          将文件拖拽至此处，或点击浏览本地存储
        </p>

        <div className="flex gap-4 mb-8">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-400 border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            100% 本地处理
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-400 border border-slate-700">
            <ImageIcon className="w-3 h-3 text-indigo-400" />
            支持 JPG, PNG, WEBP, HEIC
          </div>
        </div>

        <input
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) onUpload(Array.from(e.target.files));
          }}
        />
        
        {/* 将 button 替换为 div，避免拦截 label 的默认触发行为 */}
        <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          选择文件
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;
