
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sun, 
  Contrast, 
  Droplets, 
  Wind, 
  Wand2, 
  Save, 
  RefreshCcw,
  Scissors,
  Palette,
  Eye,
  Type,
  Plus,
  Trash2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Shirt
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ImageData, ImageFilters, ImageTransform } from '../types';
import { DEFAULT_FILTERS, DEFAULT_TRANSFORM, ASPECT_RATIOS } from '../constants';
import AIAnalysisPanel from './AIAnalysisPanel';

interface TextOverlay {
  id: string;
  content: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  size: number;
  color: string;
  rotation: number; // 0-360 degrees
  align: 'left' | 'center' | 'right';
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

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

    const isRotated = transform.rotate % 180 !== 0;
    const baseWidth = isRotated ? img.height : img.width;
    const baseHeight = isRotated ? img.width : img.height;

    let finalWidth = baseWidth;
    let finalHeight = baseHeight;

    if (selectedRatio !== null) {
      if (baseWidth / baseHeight > selectedRatio) {
        finalWidth = baseHeight * selectedRatio;
        finalHeight = baseHeight;
      } else {
        finalWidth = baseWidth;
        finalHeight = baseWidth / selectedRatio;
      }
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

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
  }, [filters, transform, showOriginal, selectedRatio, texts]);

  useEffect(() => {
    renderImage();
  }, [renderImage]);

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
            { text: `Keep the main subject in the center. Replace the entire background with: ${bgPrompt}. Make it look realistic and professionally edited.` }
          ]
        }
      });

      handleAIResponse(response);
    } catch (error) {
      console.error(error);
      alert("AI 处理失败，请检查 API 配置。");
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
            { text: `Maintain the person's identity, face, pose, and background exactly. Only change the clothing to: ${outfitPrompt}. Ensure the new clothing fits the person's body shape and lighting perfectly.` }
          ]
        }
      });

      handleAIResponse(response);
    } catch (error) {
      console.error(error);
      alert("换装失败，AI 无法处理该请求，请尝试更温和的描述。");
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

  const handleFilterChange = (key: keyof ImageFilters, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setTransform(DEFAULT_TRANSFORM);
    setSelectedRatio(null);
    setTexts([]);
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
        <div className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-300">
          <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-full object-contain shadow-2xl transition-all duration-500 ${isMagicProcessing ? 'opacity-30 blur-sm scale-95' : 'opacity-100 scale-100'}`} 
          />
          {isMagicProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                <Sparkles className="absolute top-0 right-0 w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <p className="text-sm font-bold tracking-widest uppercase animate-pulse">AI 正在施展构图魔法...</p>
            </div>
          )}
        </div>
        
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 shadow-lg">
          <button 
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase"
          >
            <Eye className="w-4 h-4" />
            长按对比原图
          </button>
          <div className="w-px bg-slate-700 mx-2" />
          <button onClick={resetAll} className="p-2 text-slate-400 hover:text-white transition-colors" title="重置所有">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white rounded-lg border border-slate-700/50 shadow-lg"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <button 
          onClick={saveLocal}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          导出图片
        </button>
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
                <Slider label="曝光度" value={filters.exposure} min={-100} max={100} onChange={v => handleFilterChange('exposure', v)} />
                <Slider label="亮度" value={filters.brightness} min={0} max={200} onChange={v => handleFilterChange('brightness', v)} />
                <Slider label="对比度" value={filters.contrast} min={0} max={200} onChange={v => handleFilterChange('contrast', v)} />
              </ControlSection>

              <ControlSection title="色彩平衡">
                <Slider label="饱和度" value={filters.saturation} min={0} max={200} onChange={v => handleFilterChange('saturation', v)} />
                <Slider label="灰度" value={filters.grayscale} min={0} max={100} onChange={v => handleFilterChange('grayscale', v)} />
                <Slider label="色相旋转" value={filters.hueRotate} min={0} max={360} onChange={v => handleFilterChange('hueRotate', v)} />
              </ControlSection>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="space-y-8">
              <ControlSection title="几何调节">
                <div className="grid grid-cols-3 gap-3">
                  <TransformButton onClick={() => setTransform(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))} icon={<RotateCw />} label="旋转" />
                  <TransformButton onClick={() => setTransform(prev => ({ ...prev, scaleX: prev.scaleX * -1 }))} icon={<FlipHorizontal />} label="水平翻转" />
                  <TransformButton onClick={() => setTransform(prev => ({ ...prev, scaleY: prev.scaleY * -1 }))} icon={<FlipVertical />} label="垂直翻转" />
                </div>
              </ControlSection>

              <ControlSection title="常用比例">
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map(ratio => (
                    <button 
                      key={ratio.label} 
                      onClick={() => setSelectedRatio(ratio.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${selectedRatio === ratio.value ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/30'}`}
                    >
                      {ratio.label === 'Original' ? '原始比例' : ratio.label}
                    </button>
                  ))}
                </div>
              </ControlSection>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <button onClick={() => setTexts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), content: '在此输入文字', x: 50, y: 50, size: 60, color: '#ffffff', rotation: 0, align: 'center' }])} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                <Plus className="w-5 h-5" /> 添加文字图层
              </button>
              <div className="space-y-4">
                {texts.map((t, idx) => (
                  <div key={t.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">图层 #{idx + 1}</span>
                      <button onClick={() => setTexts(prev => prev.filter(item => item.id !== t.id))} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={t.content} onChange={(e) => setTexts(prev => prev.map(item => item.id === t.id ? { ...item, content: e.target.value } : item))} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors" />
                    <div className="grid grid-cols-2 gap-4">
                      <Slider label="水平位置" value={t.x} min={0} max={100} onChange={v => setTexts(prev => prev.map(item => item.id === t.id ? { ...item, x: v } : item))} />
                      <Slider label="垂直位置" value={t.y} min={0} max={100} onChange={v => setTexts(prev => prev.map(item => item.id === t.id ? { ...item, y: v } : item))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'magic' && (
            <div className="space-y-6">
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl"><Sparkles className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI 背景重绘</h3>
                    <p className="text-[10px] text-slate-400">描述场景，AI 将重绘背景</p>
                  </div>
                </div>
                <textarea value={bgPrompt} onChange={(e) => setBgPrompt(e.target.value)} placeholder="如：在繁华的东京街头..." className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed" />
                <button onClick={replaceBackground} disabled={isMagicProcessing || !bgPrompt.trim()} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                  {isMagicProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} 执行魔法重绘
                </button>
              </div>

              {/* 将换装功能移至此处 */}
              <div className="p-5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Shirt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI 智能换装</h3>
                    <p className="text-[10px] text-slate-400">一键重绘人物服饰</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input 
                    type="text"
                    value={outfitPrompt}
                    onChange={(e) => setOutfitPrompt(e.target.value)}
                    placeholder="描述想要的服装，如：黑色西装..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button 
                    onClick={changeOutfit}
                    disabled={isMagicProcessing || !outfitPrompt.trim()}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    {isMagicProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    执行智能换装
                  </button>
                </div>
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

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-medium"><span className="text-slate-400">{label}</span><span className="text-indigo-400">{value}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
  </div>
);

const TransformButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-slate-200 transition-all text-center">
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 mb-1.5' })}
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

export default EditorView;
