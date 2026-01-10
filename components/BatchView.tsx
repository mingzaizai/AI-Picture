
import React, { useState, useRef } from 'react';
import { 
  Play, 
  Settings2, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Files,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { ImageData } from '../types';

interface BatchViewProps {
  images: ImageData[];
  onRemove: (id: string) => void;
  onUpload: (files: File[]) => void;
}

const BatchView: React.FC<BatchViewProps> = ({ images, onRemove, onUpload }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{name: string, dataUrl: string}[]>([]);
  
  // 状态管理
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [scaleMode, setScaleMode] = useState<'original' | '1920' | '1080' | '50%'>('original');
  const [autoBalance, setAutoBalance] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startBatch = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setResults([]);

    const processedItems: {name: string, dataUrl: string}[] = [];

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      try {
        const result = await processImage(imgData);
        processedItems.push(result);
      } catch (err) {
        console.error(`处理失败: ${imgData.file.name}`, err);
      }
      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setResults(processedItems);
    setProcessing(false);
  };

  const processImage = (imgData: ImageData): Promise<{name: string, dataUrl: string}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgData.preview;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return reject('Canvas 不可用');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Context 不可用');

        let targetWidth = img.width;
        let targetHeight = img.height;

        // 处理缩放
        if (scaleMode === '1920') {
          const ratio = Math.min(1920 / img.width, 1);
          targetWidth = img.width * ratio;
          targetHeight = img.height * ratio;
        } else if (scaleMode === '1080') {
          const ratio = Math.min(1080 / img.width, 1);
          targetWidth = img.width * ratio;
          targetHeight = img.height * ratio;
        } else if (scaleMode === '50%') {
          targetWidth = img.width * 0.5;
          targetHeight = img.height * 0.5;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 如果开启自动平衡（模拟简单增强）
        if (autoBalance) {
          ctx.filter = 'contrast(1.1) saturate(1.1)';
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        const ext = outputFormat.split('/')[1];
        const dataUrl = canvas.toDataURL(outputFormat, quality / 100);
        const newName = `${imgData.file.name.split('.')[0]}_processed.${ext}`;
        
        resolve({ name: newName, dataUrl });
      };
      img.onerror = reject;
    });
  };

  const downloadAll = () => {
    results.forEach((res, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = res.dataUrl;
        link.download = res.name;
        link.click();
      }, index * 200); // 间隔下载防止浏览器拦截
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0f172a]">
      {/* 隐藏的离屏 Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Files className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-200">待处理队列 ({images.length})</h3>
          </div>
          {images.length > 0 && !processing && (
            <button 
              onClick={() => images.forEach(img => onRemove(img.id))} 
              className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              清空列表
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Plus className="w-12 h-12 opacity-20" />
              <p className="text-sm">队列中暂无图片</p>
            </div>
          ) : (
            images.map(img => (
              <div key={img.id} className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 group">
                <img src={img.preview} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-900" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{img.file.name}</p>
                  <p className="text-[10px] text-slate-500">{(img.size / 1024).toFixed(1)} KB • {img.file.type.split('/')[1].toUpperCase()}</p>
                </div>
                {!processing && (
                  <button 
                    onClick={() => onRemove(img.id)}
                    className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full md:w-96 bg-[#0a0f1d] p-8 shrink-0 flex flex-col">
        <div className="mb-8 overflow-y-auto pr-2 no-scrollbar">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-200">批量输出设置</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">输出格式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'JPEG', value: 'image/jpeg' },
                  { label: 'PNG', value: 'image/png' },
                  { label: 'WEBP', value: 'image/webp' }
                ].map(fmt => (
                  <button 
                    key={fmt.label} 
                    onClick={() => setOutputFormat(fmt.value as any)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      outputFormat === fmt.value 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">压缩质量 ({quality}%)</label>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">尺寸缩放模式</label>
              <select 
                value={scaleMode}
                onChange={(e) => setScaleMode(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="original">保持原尺寸</option>
                <option value="1920">限制长边 1920px</option>
                <option value="1080">限制长边 1080px</option>
                <option value="50%">按比例缩小 50%</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">智能增强选项</label>
              <button 
                onClick={() => setAutoBalance(!autoBalance)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  autoBalance ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-medium text-slate-300">自动场景光影平衡</span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  autoBalance ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-900 border-slate-700'
                }`}>
                  {autoBalance && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-800">
          {processing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  正在处理...
                </span>
                <span className="text-xs font-black text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" /> 成功处理 {results.length} 张图片
              </div>
              <button 
                onClick={downloadAll}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-xl shadow-green-600/20 active:scale-95"
              >
                <Download className="w-5 h-5" />
                下载所有结果
              </button>
              <button 
                onClick={() => setResults([])}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors"
              >
                继续编辑队列
              </button>
            </div>
          ) : (
            <button 
              onClick={startBatch}
              disabled={images.length === 0}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-xl
                ${images.length > 0 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'}
              `}
            >
              <Play className="w-5 h-5 fill-current" />
              开始批量执行
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchView;
