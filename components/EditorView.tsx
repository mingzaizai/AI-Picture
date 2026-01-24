
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Save, 
  RefreshCcw,
  Palette,
  Undo2,
  Sparkles,
  Loader2,
  Shirt,
  Wand2,
  Pipette,
  Copy,
  CheckCircle2,
  ImagePlus,
  Zap,
  Grid,
  Scissors
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ImageData, ImageFilters, ImageTransform } from '../types';
import { DEFAULT_FILTERS, DEFAULT_TRANSFORM, FILTER_PRESETS } from '../constants';

interface EditorState {
  filters: ImageFilters;
  transform: ImageTransform;
}

interface EditorViewProps {
  image: ImageData;
  onClose: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ image, onClose }) => {
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM);
  const [history, setHistory] = useState<EditorState[]>([]);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets' | 'magic' | 'color'>('adjust');
  const [isMagicProcessing, setIsMagicProcessing] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [genPrompt, setGenPrompt] = useState('');
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  
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

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-19), { filters: JSON.parse(JSON.stringify(filters)), transform: JSON.parse(JSON.stringify(transform)) }]);
  }, [filters, transform]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setFilters(last.filters);
    setTransform(last.transform);
    setHistory(prev => prev.slice(0, -1));
  };

  const getFilterString = (f: ImageFilters) => {
    return `
      brightness(${f.brightness}%) 
      contrast(${f.contrast}%) 
      saturate(${f.saturation}%) 
      blur(${f.blur}px) 
      sepia(${f.sepia}%) 
      grayscale(${f.grayscale}%)
      hue-rotate(${f.hueRotate}deg)
    `.trim();
  };

  const renderImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { crop } = transform;
    const sWidth = img.width * (1 - (crop.left + crop.right) / 100);
    const sHeight = img.height * (1 - (crop.top + crop.bottom) / 100);
    const sx = img.width * (crop.left / 100);
    const sy = img.height * (crop.top / 100);

    const isRotated = transform.rotate % 180 !== 0;
    canvas.width = isRotated ? sHeight : sWidth;
    canvas.height = isRotated ? sWidth : sHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transform.rotate * Math.PI) / 180);
    ctx.scale(transform.scaleX, transform.scaleY);
    
    if (filters.borderRadius > 0) {
      const minDim = Math.min(sWidth, sHeight);
      const radius = (minDim / 2) * (filters.borderRadius / 100);
      ctx.beginPath();
      
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-sWidth / 2, -sHeight / 2, sWidth, sHeight, radius);
      } else {
        const x = -sWidth / 2;
        const y = -sHeight / 2;
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + sWidth, y, x + sWidth, y + sHeight, radius);
        ctx.arcTo(x + sWidth, y + sHeight, x, y + sHeight, radius);
        ctx.arcTo(x, y + sHeight, x, y, radius);
        ctx.arcTo(x, y, x + sWidth, y, radius);
      }
      ctx.clip();
    }

    ctx.filter = getFilterString(filters);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
    ctx.restore();
  }, [filters, transform]);

  useEffect(() => { renderImage(); }, [renderImage]);

  // 新增取色处理逻辑
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'color') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // 将鼠标坐标转换为 canvas 内部像素坐标
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      setPickedColor(hex);
    } catch (err) {
      console.error("无法取色:", err);
    }
  };

  const handleCropDrag = (edge: 'top' | 'bottom' | 'left' | 'right', deltaPct: number) => {
    setTransform(prev => {
      const nextCrop = { ...prev.crop };
      nextCrop[edge] = Math.max(0, Math.min(80, nextCrop[edge] + deltaPct));
      
      if (edge === 'top' && nextCrop.top + nextCrop.bottom >= 100) nextCrop.top = 100 - nextCrop.bottom - 1;
      if (edge === 'bottom' && nextCrop.top + nextCrop.bottom >= 100) nextCrop.bottom = 100 - nextCrop.top - 1;
      if (edge === 'left' && nextCrop.left + nextCrop.right >= 100) nextCrop.left = 100 - nextCrop.right - 1;
      if (edge === 'right' && nextCrop.left + nextCrop.right >= 100) nextCrop.right = 100 - nextCrop.left - 1;
      
      return { ...prev, crop: nextCrop };
    });
  };

  const handleAIAction = async (prompt: string, actionType: 'edit' | 'generate' | 'upscale') => {
    if (!prompt.trim() && actionType !== 'upscale') return;
    setIsMagicProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let response;
      const canvas = canvasRef.current;
      const base64Data = canvas?.toDataURL('image/png').split(',')[1];

      if (actionType === 'generate') {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });
      } else {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data || '' } },
              { text: actionType === 'upscale' ? "Please enhance the quality and details of this image, make it sharper and clearer." : prompt }
            ]
          }
        });
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newImg = new Image();
          newImg.src = `data:image/png;base64,${part.inlineData.data}`;
          newImg.onload = () => {
            imgRef.current = newImg;
            setTransform(DEFAULT_TRANSFORM);
            if (actionType === 'generate') setGenPrompt('');
            else setMagicPrompt('');
            renderImage();
          };
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("AI 操作失败，请检查 API Key。");
    } finally {
      setIsMagicProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0a0f1d]">
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center p-8">
        <div ref={containerRef} className="relative inline-block group">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            className={`max-w-full max-h-[80vh] object-contain shadow-2xl transition-all duration-500 
              ${isMagicProcessing ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}
              ${activeTab === 'color' ? 'cursor-crosshair' : 'cursor-default'}
            `} 
          />

          {isCropMode && !isMagicProcessing && (
            <div className="absolute inset-0 z-10 pointer-events-none border-2 border-indigo-500/50">
               <CropHandle edge="top" onDrag={(d) => handleCropDrag('top', d)} onStart={saveToHistory} />
               <CropHandle edge="bottom" onDrag={(d) => handleCropDrag('bottom', d)} onStart={saveToHistory} />
               <CropHandle edge="left" onDrag={(d) => handleCropDrag('left', d)} onStart={saveToHistory} />
               <CropHandle edge="right" onDrag={(d) => handleCropDrag('right', d)} onStart={saveToHistory} />
               <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                 <div className="border border-white/20" /><div className="border border-white/20" /><div className="border border-white/20" />
                 <div className="border border-white/20" /><div className="border border-white/20" /><div className="border border-white/20" />
                 <div className="border border-white/20" /><div className="border border-white/20" /><div className="border border-white/20" />
               </div>
            </div>
          )}

          {isMagicProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
              <p className="text-xs font-bold tracking-widest animate-pulse uppercase">AI 魔法处理中...</p>
            </div>
          )}
        </div>
        
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg z-20">
          <button onClick={handleUndo} disabled={history.length === 0} className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold ${history.length > 0 ? 'text-indigo-400 hover:bg-indigo-400/10' : 'text-slate-600 cursor-not-allowed'}`}><Undo2 className="w-4 h-4" /> 撤销</button>
          <div className="w-px bg-slate-700 mx-1.5" />
          <button onClick={() => { saveToHistory(); setFilters(DEFAULT_FILTERS); setTransform(DEFAULT_TRANSFORM); }} className="flex items-center gap-2 px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md text-xs font-bold transition-all"><RefreshCcw className="w-4 h-4" /> 重置</button>
        </div>

        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white rounded-lg border border-slate-700/50 transition-all z-20"><X className="w-5 h-5" /></button>
        <button onClick={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const mimeType = (filters.borderRadius > 0 || transform.crop.left > 0) ? 'image/png' : 'image/jpeg';
          const ext = mimeType === 'image/png' ? 'png' : 'jpg';
          const link = document.createElement('a');
          link.download = `aipicture_${Date.now()}.${ext}`;
          link.href = canvas.toDataURL(mimeType, 0.95);
          link.click();
        }} className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-95 z-20"><Save className="w-5 h-5" /> 导出图片</button>
      </div>

      <div className="w-full md:w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0">
        <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={<Palette />} label="微调" />
          <TabButton active={activeTab === 'presets'} onClick={() => setActiveTab('presets')} icon={<Grid />} label="模板" />
          <TabButton active={activeTab === 'magic'} onClick={() => setActiveTab('magic')} icon={<Sparkles />} label="魔法" />
          <TabButton active={activeTab === 'color'} onClick={() => setActiveTab('color')} icon={<Pipette />} label="取色" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'adjust' && (
            <div className="space-y-6">
              <ControlSection title="光影调节">
                <Slider label="亮度" value={filters.brightness} min={0} max={200} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, brightness: v }))} />
                <Slider label="对比度" value={filters.contrast} min={0} max={200} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, contrast: v }))} />
                <Slider label="曝光度" value={filters.exposure} min={-100} max={100} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, exposure: v }))} />
              </ControlSection>
              <ControlSection title="风格倾向">
                <Slider label="饱和度" value={filters.saturation} min={0} max={200} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, saturation: v }))} />
                <Slider label="怀旧色" value={filters.sepia} min={0} max={100} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, sepia: v }))} />
                <Slider label="黑白色" value={filters.grayscale} min={0} max={100} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, grayscale: v }))} />
                <Slider label="色相旋转" value={filters.hueRotate} min={0} max={360} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, hueRotate: v }))} />
              </ControlSection>
              <ControlSection title="变换与形状">
                <Slider label="圆角弧度" value={filters.borderRadius} min={0} max={100} onStart={saveToHistory} onChange={v => setFilters(p => ({ ...p, borderRadius: v }))} />
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">剪切模式</label>
                   <button 
                     onClick={() => setIsCropMode(!isCropMode)}
                     className={`p-1.5 rounded-lg border transition-all ${isCropMode ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                   >
                     <Scissors className="w-3.5 h-3.5" />
                   </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <TransformButton onClick={() => { saveToHistory(); setTransform(p => ({ ...p, rotate: (p.rotate + 90) % 360 })); }} icon={<RotateCw />} label="旋转" />
                  <TransformButton onClick={() => { saveToHistory(); setTransform(p => ({ ...p, scaleX: p.scaleX * -1 })); }} icon={<FlipHorizontal />} label="水平" />
                  <TransformButton onClick={() => { saveToHistory(); setTransform(p => ({ ...p, scaleY: p.scaleY * -1 })); }} icon={<FlipVertical />} label="垂直" />
                </div>
              </ControlSection>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">大师滤镜模板</h4>
              <div className="grid grid-cols-2 gap-3">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => { saveToHistory(); setFilters({ ...preset.values }); }}
                    className="group relative flex flex-col gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left"
                  >
                    <div className="aspect-video rounded-lg bg-slate-900 overflow-hidden relative">
                       <img 
                         src={image.preview} 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                         style={{ filter: getFilterString(preset.values) }}
                       />
                       <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[8px] font-bold uppercase text-white/80">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'magic' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2"><ImagePlus className="w-4 h-4 text-indigo-400" /> AI 创意生成</h3>
                <textarea value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="描述你想生成的全新图片..." className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-3 text-[11px] text-slate-200 outline-none focus:border-indigo-500" />
                <button onClick={() => handleAIAction(genPrompt, 'generate')} disabled={isMagicProcessing || !genPrompt.trim()} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"><Zap className="w-3 h-3" /> 生成</button>
              </div>
              <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2"><Shirt className="w-4 h-4 text-purple-400" /> AI 局部重绘</h3>
                <textarea value={magicPrompt} onChange={(e) => setMagicPrompt(e.target.value)} placeholder="描述修改部分..." className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-3 text-[11px] text-slate-200 outline-none focus:border-indigo-500" />
                <button onClick={() => handleAIAction(magicPrompt, 'edit')} disabled={isMagicProcessing || !magicPrompt.trim()} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all">执行魔法</button>
              </div>
            </div>
          )}

          {activeTab === 'color' && (
            <div className="p-6 bg-slate-800/50 rounded-2xl flex flex-col items-center gap-4 border border-slate-700/50">
              <div className="w-20 h-20 rounded-2xl shadow-inner border border-white/10" style={{ backgroundColor: pickedColor || 'transparent' }} />
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">点击左侧图片取色</p>
                <button 
                  onClick={() => { 
                    if (!pickedColor) return;
                    navigator.clipboard.writeText(pickedColor); 
                    setCopyFeedback(true); 
                    setTimeout(() => setCopyFeedback(false), 2000); 
                  }} 
                  disabled={!pickedColor} 
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {copyFeedback ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
                  {pickedColor || '待取色'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CropHandle: React.FC<{ edge: 'top' | 'bottom' | 'left' | 'right', onDrag: (d: number) => void, onStart: () => void }> = ({ edge, onDrag, onStart }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    onStart();
    const startY = e.clientY;
    const startX = e.clientX;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      const deltaX = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      if (edge === 'top') onDrag(deltaY);
      if (edge === 'bottom') onDrag(-deltaY);
      if (edge === 'left') onDrag(deltaX);
      if (edge === 'right') onDrag(-deltaX);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const styleMap = {
    top: "top-0 left-0 right-0 h-2 cursor-ns-resize",
    bottom: "bottom-0 left-0 right-0 h-2 cursor-ns-resize",
    left: "top-0 bottom-0 left-0 w-2 cursor-ew-resize",
    right: "top-0 bottom-0 right-0 w-2 cursor-ew-resize"
  };

  return (
    <div 
      onMouseDown={handleMouseDown} 
      className={`absolute z-20 hover:bg-indigo-400/50 pointer-events-auto transition-colors ${styleMap[edge]}`} 
    />
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 py-4 px-1 flex flex-col items-center gap-1 transition-all border-b-2 ${active ? 'bg-indigo-600/5 text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
    <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onStart?: () => void; onChange: (v: number) => void }> = ({ label, value, min, max, onStart, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-medium"><span className="text-slate-400">{label}</span><span className="text-indigo-400">{value}</span></div>
    <input type="range" min={min} max={max} value={value} onMouseDown={onStart} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
  </div>
);

const TransformButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-slate-200 transition-all text-center group">
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 mb-1.5 group-hover:scale-110' })}
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

export default EditorView;
