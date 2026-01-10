
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Layers, 
  Settings, 
  ChevronRight, 
  Download, 
  Undo, 
  Redo, 
  Trash2, 
  Plus, 
  Maximize2,
  Box,
  Wand2,
  History
} from 'lucide-react';
import { AppMode, ImageData } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import EditorView from './components/EditorView';
import LibraryView from './components/LibraryView';
import BatchView from './components/BatchView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LIBRARY);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleUpload = useCallback((newFiles: File[]) => {
    const newImages: ImageData[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      width: 0,
      height: 0,
      lastModified: file.lastModified,
      size: file.size
    }));

    setImages(prev => [...prev, ...newImages]);
    
    if (images.length === 0 && newFiles.length === 1) {
      setSelectedImageId(newImages[0].id);
      setMode(AppMode.EDITOR);
    }
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
    if (selectedImageId === id) setSelectedImageId(null);
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  const handleGlobalExport = () => {
    if (mode === AppMode.EDITOR) {
      // 通过模拟点击编辑器内的保存按钮
      const saveBtn = document.querySelector('button[title="导出图片"]') as HTMLButtonElement;
      if (saveBtn) saveBtn.click();
    } else if (mode === AppMode.BATCH) {
      // 提示用户在批量面板操作
      const batchDownloadBtn = document.querySelector('button:contains("下载所有结果")') as HTMLButtonElement;
      if (batchDownloadBtn) {
        batchDownloadBtn.click();
      } else {
        alert("请先点击'开始批量执行'以生成结果。");
      }
    } else if (mode === AppMode.LIBRARY) {
      alert("请进入编辑模式或批量模式进行导出。");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden text-slate-200">
      <aside className="w-16 md:w-20 border-r border-slate-800 flex flex-col items-center py-6 bg-[#0a0f1d] shrink-0">
        <div className="mb-8 p-2 bg-indigo-600 rounded-xl">
          <Maximize2 className="w-6 h-6 text-white" />
        </div>
        
        <nav className="flex flex-col gap-6">
          <NavButton 
            active={mode === AppMode.LIBRARY} 
            icon={<ImageIcon />} 
            label="图库" 
            onClick={() => setMode(AppMode.LIBRARY)} 
          />
          <NavButton 
            active={mode === AppMode.EDITOR} 
            icon={<Layers />} 
            label="编辑" 
            onClick={() => {
              if (selectedImageId) setMode(AppMode.EDITOR);
              else alert('请先选择一张图片');
            }} 
            disabled={!selectedImageId}
          />
          <NavButton 
            active={mode === AppMode.BATCH} 
            icon={<Box />} 
            label="批量" 
            onClick={() => setMode(AppMode.BATCH)} 
          />
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <NavButton 
            active={mode === AppMode.SETTINGS}
            icon={<Settings />} 
            label="设置" 
            onClick={() => setMode(AppMode.SETTINGS)} 
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
          mode={mode} 
          onExport={handleGlobalExport} 
          canExport={mode === AppMode.EDITOR ? !!selectedImageId : images.length > 0} 
          imagesCount={images.length}
        />

        <div className="flex-1 overflow-hidden">
          {mode === AppMode.LIBRARY && (
            <LibraryView 
              images={images} 
              onSelect={(id) => {
                setSelectedImageId(id);
                setMode(AppMode.EDITOR);
              }}
              onRemove={removeImage}
              onUpload={handleUpload}
            />
          )}

          {mode === AppMode.EDITOR && selectedImage && (
            <EditorView 
              image={selectedImage} 
              onClose={() => setMode(AppMode.LIBRARY)}
            />
          )}

          {mode === AppMode.BATCH && (
            <BatchView 
              images={images} 
              onRemove={removeImage}
              onUpload={handleUpload}
            />
          )}

          {mode === AppMode.SETTINGS && (
            <SettingsView />
          )}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 group
      ${active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
    <span className="text-[10px] font-medium tracking-wider">{label}</span>
  </button>
);

export default App;
