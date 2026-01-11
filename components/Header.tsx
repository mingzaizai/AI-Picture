
import React from 'react';
import { Download, Share2, MoreHorizontal } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  onExport: () => void;
  canExport: boolean;
  imagesCount: number;
}

const Header: React.FC<HeaderProps> = ({ mode, onExport, canExport, imagesCount }) => {
  const getTitle = () => {
    switch (mode) {
      case AppMode.LIBRARY: return '图片库';
      case AppMode.EDITOR: return '高级编辑器';
      case AppMode.BATCH: return '批量处理中心';
      default: return 'AI Picture';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-[#0a0f1d] shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          {getTitle()}
        </h1>
        {imagesCount > 0 && (
          <span className="px-2 py-0.5 bg-slate-800 rounded-full text-xs font-medium text-slate-400">
            {imagesCount} 个文件
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Move title to the button element as Lucide icons don't support it */}
        <button className="p-2 text-slate-400 hover:text-white transition-colors" title="分享">
          <Share2 className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white transition-colors" title="更多">
          <MoreHorizontal className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          disabled={!canExport}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${canExport 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
          `}
        >
          <Download className="w-4 h-4" />
          导出结果
        </button>
      </div>
    </header>
  );
};

export default Header;
