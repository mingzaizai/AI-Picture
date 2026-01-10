
import React from 'react';
import { Shield, Key, Cpu, Info, Github, ExternalLink, HardDrive } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-8 md:p-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">系统设置</h2>
          <div className="grid gap-4">
            <SettingsCard 
              icon={<Shield className="text-green-400" />}
              title="隐私模式"
              description="当前处于 100% 本地处理模式。您的图片不会被上传至任何第三方服务器进行存储。"
            />
            <SettingsCard 
              icon={<Key className="text-indigo-400" />}
              title="Gemini API 状态"
              description={process.env.API_KEY ? "API 密钥已配置，AI 功能可用。" : "未检测到 API 密钥，AI 功能可能受限。"}
            />
            <SettingsCard 
              icon={<Cpu className="text-purple-400" />}
              title="硬件加速"
              description="已启用 WebGL 和 Canvas 硬件加速，以获得流畅的编辑体验。"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">存储管理</h2>
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4 mb-4">
              <HardDrive className="w-6 h-6 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-white">本地缓存</p>
                <p className="text-xs text-slate-400">管理浏览器为 PixelMind 预留的临时空间</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-600">
              清空所有本地数据
            </button>
          </div>
        </section>

        <section className="pt-10 border-t border-slate-800">
          <div className="flex flex-col md:flex-row gap-8 justify-between text-slate-500">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4" /> PixelMind v1.2.0
              </p>
              <p className="text-xs max-w-xs leading-relaxed">
                一款由世界级工程师打造的高性能、隐私友好的本地图片处理工具。
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2 text-xs">
                <Github className="w-4 h-4" /> 源代码
              </a>
              <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 text-xs">
                Gemini 文档 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingsCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
    <div className="p-2 bg-slate-900 rounded-xl shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default SettingsView;
