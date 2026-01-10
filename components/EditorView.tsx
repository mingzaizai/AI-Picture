
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Save, 
  RefreshCcw,
  Scissors,
  Palette,
  Eye,
  Type,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Shirt,
  Check,
  Crop as CropIcon,
  Move,
  // Added missing Wand2 icon
  Wand2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ImageData, ImageFilters, ImageTransform } from '../types';
import { DEFAULT_FILTERS, DEFAULT_TRANSFORM, ASPECT_RATIOS } from '../constants';
import AIAnalysisPanel from './AIAnalysisPanel';

interface TextOverlay {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  align: 'left' | 'center' | 'right';
}

interface CropBox {
  x: number; // 0-100 percentage
  y: number;
  width: number;
  height: number;
}

interface EditorViewProps {
  image: ImageData;
  onClose: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ image, onClose }) => {
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop' | 'text' | 'magic' | 'ai'>('adjust');
  const [showOriginal, setShowOriginal] = useState(false);
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [isMagicProcessing, setIsMagicProcessing] = useState(false);
  const [bgPrompt, setBgPrompt] = useState('');
  const [outfitPrompt, setOutfitPrompt] = useState('');
  
  // 裁剪相关状态
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.preview;
    img.onload = () => {
      imgRef.current = img;
      renderImage();
    };
  }, [image]);

  const renderImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 基础渲染逻辑保持不变（旋转、翻转、滤镜）
    const isRotated = transform.rotate % 180 !== 0;
    canvas.width = isRotated ? img.height : img.width;
    canvas.height = isRotated ? img.width : img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transform.rotate * Math.PI) / 180);
    ctx.scale(transform.scaleX, transform.scaleY);
    
    const filterStr = showOriginal ? 'none' : `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px) 
      sepia(${filters.sepia}%) 
      grayscale(${filters.grayscale}%)
      hue-rotate(${filters.hueRotate}deg)
    `.trim();
    
    ctx.filter = filterStr;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // 渲染文字
    if (!showOriginal) {
      texts.forEach(t => {
        ctx.save();
        const posX = (t.x / 100) * canvas.width;
        const posY = (t.y / 100) * canvas.height;
        ctx.translate(posX, posY);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.fillStyle = t.color;
        const responsiveSize = (t.size * canvas.height) / 1000;
        ctx.font = `bold ${responsiveSize}px "Inter", "Microsoft YaHei"`;
        ctx.textAlign = t.align;
        ctx.textBaseline = 'middle';
        ctx.fillText(t.content, 0, 0);
        ctx.restore();
      });
    }
  }, [filters, transform, showOriginal, texts]);

  useEffect(() => {
    renderImage();
  }, [renderImage]);

  // 裁剪逻辑更新：使用 cropBox 的百分比坐标进行物理像素提取
  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsMagicProcessing(true);
    setTimeout(() => {
      const sourceWidth = canvas.width;
      const sourceHeight = canvas.height;
      
      const cropX = (cropBox.x / 100) * sourceWidth;
      const cropY = (cropBox.y / 100) * sourceHeight;
      const cropW = (cropBox.width / 100) * sourceWidth;
      const cropH = (cropBox.height / 100) * sourceHeight;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropW;
      tempCanvas.height = cropH;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const dataUrl = tempCanvas.toDataURL('image/png');
        const newImg = new Image();
        newImg.src = dataUrl;
        newImg.onload = () => {
          imgRef.current = newImg;
          setTransform(DEFAULT_TRANSFORM);
          setCropBox({ x: 10, y: 10, width: 80, height: 80 });
          setSelectedRatio(null);
          setIsMagicProcessing(false);
          renderImage();
        };
      }
    }, 300);
  };

  // 裁剪框交互逻辑
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || activeTab !== 'crop' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCropBox(prev => {
      let next = { ...prev };
      const minSize = 5;

      if (isDragging === 'move') {
        // 简单移动逻辑省略（为了保持精简，主要实现拉伸）
      } else if (isDragging === 'nw') {
        next.width = prev.x + prev.width - x;
        next.height = prev.y + prev.height - y;
        next.x = x;
        next.y = y;
      } else if (isDragging === 'se') {
        next.width = x - prev.x;
        next.height = y - prev.y;
      } else if (isDragging === 'ne') {
        next.width = x - prev.x;
        next.height = prev.y + prev.height - y;
        next.y = y;
      } else if (isDragging === 'sw') {
        next.width = prev.x + prev.width - x;
        next.height = y - prev.y;
        next.x = x;
      }

      // 限制最小尺寸和边界
      next.x = Math.max(0, Math.min(next.x, 100 - minSize));
      next.y = Math.max(0, Math.min(next.y, 100 - minSize));
      next.width = Math.max(minSize, Math.min(next.width, 100 - next.x));
      next.height = Math.max(minSize, Math.min(next.height, 100 - next.y));

      return next;
    });
  }, [isDragging, activeTab]);

  useEffect(() => {
    const endDrag = () => setIsDragging(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', endDrag);
    };
  }, [handleMouseMove]);

  const replaceBackground = async () => {
    if (!bgPrompt.trim()) return;
    setIsMagicProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: `Background replacement prompt: ${bgPrompt}` }
          ]
        }
      });
      handleAIResponse(response);
    } catch (error) {
      console.error(error);
      alert("AI 魔法失败了，请稍后再试。");
    } finally {
      setIsMagicProcessing(false);
    }
  };

  const changeOutfit = async () => {
    if (!outfitPrompt.trim()) return;
    setIsMagicProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: `Change the clothing to: ${outfitPrompt}. Keep body and face unchanged.` }
          ]
        }
      });
      handleAIResponse(response);
    } catch (error) {
      console.error(error);
      alert("换装失败。");
    } finally {
      setIsMagicProcessing(false);
    }
  };

  const handleAIResponse = (response: any) => {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const newImg = new Image();
        newImg.src = `data:image/png;base64,${part.inlineData.data}`;
        newImg.onload = () => {
          imgRef.current = newImg;
          setBgPrompt('');
          setOutfitPrompt('');
          renderImage();
        };
        break;
      }
    }
  };

  const saveLocal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pixelmind_${image.file.name}`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0a0f1d]">
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center p-8 group">
        <div ref={containerRef} className="relative inline-block transition-all duration-300">
          <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-[80vh] object-contain shadow-2xl transition-all duration-500 ${isMagicProcessing ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}`} 
          />
          
          {/* 交互式裁剪层 */}
          {activeTab === 'crop' && !isMagicProcessing && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 暗色遮罩 */}
              <div className="absolute inset-0 bg-black/60" style={{ clipPath: `polygon(0% 0%, 0% 100%, ${cropBox.x}% 100%, ${cropBox.x}% ${cropBox.y}%, ${cropBox.x + cropBox.width}% ${cropBox.y}%, ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, ${cropBox.x}% ${cropBox.y + cropBox.height}%, ${cropBox.x}% 100%, 100% 100%, 100% 0%)` }} />
              
              {/* 裁剪框体 */}
              <div 
                className="absolute border-2 border-indigo-400 pointer-events-auto cursor-move shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.width}%`, height: `${cropBox.height}%` }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* 内部网格 */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => <div key={i} className="border border-white/10" />)}
                </div>
                
                {/* 拖拽手柄 */}
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize shadow-lg" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize shadow-lg" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize shadow-lg" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize shadow-lg" onMouseDown={(e) => handleMouseDown(e, 'se')} />
                
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-6 bg-indigo-500 rounded-full cursor-w-resize" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-6 bg-indigo-500 rounded-full cursor-e-resize" />
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-6 h-2 bg-indigo-500 rounded-full cursor-n-resize" />
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-2 bg-indigo-500 rounded-full cursor-s-resize" />
              </div>
            </div>
          )}

          {isMagicProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
              <p className="text-xs font-bold tracking-widest animate-pulse">魔法处理中...</p>
            </div>
          )}
        </div>
        
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 shadow-lg">
          <button onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)} className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold">
            <Eye className="w-4 h-4" /> 长按对比
          </button>
          <div className="w-px bg-slate-700 mx-2" />
          <button onClick={() => { setFilters(DEFAULT_FILTERS); setTransform(DEFAULT_TRANSFORM); }} className="p-2 text-slate-400 hover:text-white transition-colors"><RefreshCcw className="w-4 h-4" /></button>
        </div>

        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white rounded-lg border border-slate-700/50 shadow-lg"><X className="w-5 h-5" /></button>
        <button onClick={saveLocal} className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-95"><Save className="w-5 h-5" /> 导出图片</button>
      </div>

      <div className="w-full md:w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0">
        <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={<Palette />} label="精修" />
          <TabButton active={activeTab === 'crop'} onClick={() => setActiveTab('crop')} icon={<Scissors />} label="构图" />
          <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<Type />} label="文字" />
          <TabButton active={activeTab === 'magic'} onClick={() => setActiveTab('magic')} icon={<Sparkles />} label="魔法" />
          <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Wand2 />} label="AI 分析" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === 'adjust' && (
            <div className="space-y-8">
              <ControlSection title="光影调节">
                <Slider label="亮度" value={filters.brightness} min={0} max={200} onChange={v => setFilters(p => ({ ...p, brightness: v }))} />
                <Slider label="对比度" value={filters.contrast} min={0} max={200} onChange={v => setFilters(p => ({ ...p, contrast: v }))} />
              </ControlSection>
              <ControlSection title="色彩调节">
                <Slider label="饱和度" value={filters.saturation} min={0} max={200} onChange={v => setFilters(p => ({ ...p, saturation: v }))} />
                <Slider label="色相" value={filters.hueRotate} min={0} max={360} onChange={v => setFilters(p => ({ ...p, hueRotate: v }))} />
              </ControlSection>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="space-y-8">
              <ControlSection title="几何调节">
                <div className="grid grid-cols-3 gap-3">
                  <TransformButton onClick={() => setTransform(p => ({ ...p, rotate: (p.rotate + 90) % 360 }))} icon={<RotateCw />} label="旋转" />
                  <TransformButton onClick={() => setTransform(p => ({ ...p, scaleX: p.scaleX * -1 }))} icon={<FlipHorizontal />} label="水平" />
                  <TransformButton onClick={() => setTransform(p => ({ ...p, scaleY: p.scaleY * -1 }))} icon={<FlipVertical />} label="垂直" />
                </div>
              </ControlSection>

              <div className="pt-6 border-t border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">裁剪控制</h4>
                <p className="text-[10px] text-slate-400">在预览区手动拖动边缘和四角调整裁剪范围。</p>
                <button 
                  onClick={applyCrop}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  执行应用裁剪 (Apply Crop)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'magic' && (
            <div className="space-y-6">
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> AI 背景重绘</h3>
                <textarea value={bgPrompt} onChange={(e) => setBgPrompt(e.target.value)} placeholder="描述新背景..." className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors" />
                <button onClick={replaceBackground} disabled={isMagicProcessing || !bgPrompt.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold">开始重绘</button>
              </div>

              <div className="p-5 bg-purple-600/10 border border-purple-500/20 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Shirt className="w-4 h-4 text-purple-400" /> AI 智能换装</h3>
                <input value={outfitPrompt} onChange={(e) => setOutfitPrompt(e.target.value)} placeholder="描述服装，如：白色 T 恤..." className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200" />
                <button onClick={changeOutfit} disabled={isMagicProcessing || !outfitPrompt.trim()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold">执行换装</button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && <AIAnalysisPanel image={image} />}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 py-4 px-2 flex flex-col items-center gap-1 transition-all border-b-2 min-w-[64px] ${active ? 'bg-indigo-600/5 text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    <span className="text-[10px] font-bold tracking-wider">{label}</span>
  </button>
);

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h4>
    <div className="space-y-5">{children}</div>
  </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-medium"><span className="text-slate-400">{label}</span><span className="text-indigo-400">{value}</span></div>
    <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
  </div>
);

const TransformButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-slate-200 transition-all text-center">
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 mb-1.5' })}
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

export default EditorView;
