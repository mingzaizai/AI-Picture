
import React from 'react';
import { FilePlus, Trash2 } from 'lucide-react';
import { ImageData } from '../types';
import ImageUploader from './ImageUploader';

interface LibraryViewProps {
  images: ImageData[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onUpload: (files: File[]) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ images, onSelect, onRemove, onUpload }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0f172a]">
      {images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <ImageUploader onUpload={onUpload} />
          <div className="mt-12 text-center max-w-md">
            <h3 className="text-xl font-semibold text-slate-200">您的创作空间是空的</h3>
            <p className="mt-2 text-slate-400">
              拖拽图片或点击上方框体开始编辑。
              所有处理均在本地进行，最大限度保护您的隐私。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white pb-1 border-b-2 border-indigo-500">
                所有图片
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white pb-1 border-b-2 border-transparent">
                最近使用
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <FilePlus className="w-4 h-4" />
                添加图片
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) onUpload(Array.from(e.target.files));
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((img) => (
              <div 
                key={img.id}
                className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
                onClick={() => onSelect(img.id)}
              >
                <div className="aspect-square overflow-hidden bg-slate-900">
                  <img 
                    src={img.preview} 
                    alt={img.file.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-200 truncate">{img.file.name}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{(img.size / 1024).toFixed(1)} KB</span>
                    <span className="uppercase">{img.file.type.split('/')[1]}</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(img.id);
                    }}
                    className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-md transition-colors shadow-lg"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
