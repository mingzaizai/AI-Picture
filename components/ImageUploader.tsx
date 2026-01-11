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
    <div className="w-full max-w-3xl">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer border-2 border-dashed rounded-[40px] p-16 flex flex-col items-center justify-center transition-all duration-500
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
            : 'border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/30 bg-slate-900/20'}
        `}
      >
        <div className="mb-8 p-6 rounded-full bg-slate-800/50 group-hover:bg-indigo-600/20 transition-all duration-500 transform group-hover:scale-110">
          <Upload className="w-14 h-14 text-slate-500 group-hover:text-indigo-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">上传图片</h2>
        <p className="text-slate-400 text-center mb-10 max-w-sm text-sm leading-relaxed">
          将文件拖拽至此处，或点击浏览本地存储。<br/>
          支持 JPG, PNG, WEBP 及 HEIC 格式。
        </p>

        <div className="flex gap-4 mb-10">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 text-[11px] font-bold text-slate-400 border border-slate-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500/80" />
            100% 本地处理
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 text-[11px] font-bold text-slate-400 border border-slate-700/50">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400/80" />
            隐私至上
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
        
        <div className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 text-sm tracking-widest uppercase">
          选择文件
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;