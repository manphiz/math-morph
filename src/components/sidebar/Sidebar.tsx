/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mode, ProTab, Param, VisualSettings, ExportConfig } from '../../types';
import { ENABLE_PRO_MODE } from '../../constants/presets';
import { AppBanner } from '../common/AppBanner';
import { EquationInput } from './EquationInput';
import { Keypad } from './Keypad';
import { LiveEquationDisplay } from './LiveEquationDisplay';
import { ParameterControls } from './ParameterControls';
import { ProAnalysisToggles } from './ProAnalysisToggles';
import { LinAlgSection } from './LinAlgSection';
import { ExportPanel } from './ExportPanel';

interface SidebarProps {
  sidebarPosition?: 'left' | 'right';
  onToggleSidebarPosition?: () => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  isProUser: boolean;
  setIsProUser: (isPro: boolean | ((prev: boolean) => boolean)) => void;
  proTab: ProTab;
  setProTab: (tab: ProTab) => void;
  rawInput: string;
  setRawInput: (val: string) => void;
  normalizedInput: string;
  params: Param[];
  activeIdx: number | null;
  isValid: boolean;
  errorMsg: string;
  showPresets: boolean;
  setShowPresets: (show: boolean | ((prev: boolean) => boolean)) => void;
  showDerivative: boolean;
  setShowDerivative: (val: boolean) => void;
  showIntegral: boolean;
  setShowIntegral: (val: boolean) => void;
  visualSettings: VisualSettings;
  setVisualSettings: React.Dispatch<React.SetStateAction<VisualSettings>>;
  matrix: number[][];
  setMatrix: (matrix: number[][]) => void;
  exportConfig: ExportConfig;
  setExportConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
  showExportSettings: boolean;
  setShowExportSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  isExporting: boolean;
  exportProgress: number;
  isExportUnlocked: boolean;
  onApplyEquation: () => void;
  insertAtCursor: (text: string) => void;
  onSelectPreset: (presetVal: string) => void;
  onResetGhost: () => void;
  onTokenClick: (index: number) => void;
  onToggleMorph: (index: number) => void;
  onUpdateParam: (index: number, val: string) => void;
  onUpdateParamRange: (index: number, type: 'min' | 'max', val: string) => void;
  onExport: (isPreview: boolean) => void;
  onUnlockExport: () => void;
}

export function Sidebar({
  mode,
  setMode,
  isProUser,
  setIsProUser,
  proTab,
  setProTab,
  rawInput,
  setRawInput,
  normalizedInput,
  params,
  activeIdx,
  isValid,
  errorMsg,
  showPresets,
  setShowPresets,
  showDerivative,
  setShowDerivative,
  showIntegral,
  setShowIntegral,
  visualSettings,
  setVisualSettings,
  matrix,
  setMatrix,
  exportConfig,
  setExportConfig,
  showExportSettings,
  setShowExportSettings,
  isExporting,
  exportProgress,
  isExportUnlocked,
  onApplyEquation,
  insertAtCursor,
  onSelectPreset,
  onResetGhost,
  onTokenClick,
  onToggleMorph,
  onUpdateParam,
  onUpdateParamRange,
  onExport,
  onUnlockExport,
  sidebarPosition = 'left',
  onToggleSidebarPosition
}: SidebarProps) {
  const borderClass = sidebarPosition === 'right' 
    ? 'landscape:border-l lg:border-l' 
    : 'landscape:border-r lg:border-r';

  return (
    <aside className={`w-full landscape:w-[260px] sm:landscape:w-[290px] md:landscape:w-[320px] lg:w-[400px] xl:w-[420px] h-full bg-panel-1 border-t landscape:border-t-0 lg:border-t-0 ${borderClass} border-white/5 p-3 sm:p-5 lg:p-6 flex flex-col gap-3 sm:gap-4 lg:gap-6 z-10 shadow-2xl overflow-y-auto`}>
      {/* App banner header displayed inside sidebar for landscape / desktop mode */}
      <header className="hidden landscape:flex lg:flex items-center justify-between">
        <AppBanner 
          mode={mode} 
          setMode={setMode} 
          sidebarPosition={sidebarPosition}
          onToggleSidebarPosition={onToggleSidebarPosition}
        />
      </header>

      {ENABLE_PRO_MODE && (
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => setIsProUser(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isProUser 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
            }`}
          >
            {isProUser ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {isProUser ? 'Pro Active' : 'Upgrade to Pro'}
          </button>

          {mode === 'pro' && (
            <div className="flex bg-panel-2 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setProTab('calculus')}
                className={`px-3 py-1 text-[9px] uppercase tracking-tighter rounded-md transition-all ${
                  proTab === 'calculus' ? 'bg-white/10 text-white font-bold' : 'text-white/30 hover:text-white/50'
                }`}
              >
                Calculus
              </button>
              <button 
                onClick={() => setProTab('linalg')}
                className={`px-3 py-1 text-[9px] uppercase tracking-tighter rounded-md transition-all ${
                  proTab === 'linalg' ? 'bg-white/10 text-white font-bold' : 'text-white/30 hover:text-white/50'
                }`}
              >
                Lin-Alg
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'muse' || (ENABLE_PRO_MODE && mode === 'pro' && proTab === 'calculus') ? (
          <motion.div
            key="calculus-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <section className="space-y-4">
              <EquationInput 
                rawInput={rawInput}
                setRawInput={setRawInput}
                isValid={isValid}
                errorMsg={errorMsg}
                onApplyEquation={onApplyEquation}
              />

              <Keypad 
                showPresets={showPresets}
                setShowPresets={setShowPresets}
                insertAtCursor={insertAtCursor}
                onClear={() => setRawInput('')}
                onSelectPreset={onSelectPreset}
              />

              <LiveEquationDisplay 
                normalizedInput={normalizedInput}
                params={params}
                activeIdx={activeIdx}
                onTokenClick={onTokenClick}
                onResetGhost={onResetGhost}
              />
            </section>

            {/* Pro Features Toggles */}
            {ENABLE_PRO_MODE && mode === 'pro' && (
              <ProAnalysisToggles 
                showDerivative={showDerivative}
                setShowDerivative={setShowDerivative}
                showIntegral={showIntegral}
                setShowIntegral={setShowIntegral}
                visualSettings={visualSettings}
                setVisualSettings={setVisualSettings}
              />
            )}
          </motion.div>
        ) : ENABLE_PRO_MODE && mode === 'pro' && proTab === 'linalg' ? (
          <motion.div
            key="linalg-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <LinAlgSection matrix={matrix} setMatrix={setMatrix} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="flex-grow">
        <ParameterControls 
          params={params}
          activeIdx={activeIdx}
          onToggleMorph={onToggleMorph}
          onUpdateParam={onUpdateParam}
          onUpdateParamRange={onUpdateParamRange}
        />

        {/* Export Animation - Only in Muse mode */}
        {mode === 'muse' && params.length > 0 && (
          <ExportPanel 
            isExporting={isExporting}
            exportProgress={exportProgress}
            showExportSettings={showExportSettings}
            setShowExportSettings={setShowExportSettings}
            visualSettings={visualSettings}
            setVisualSettings={setVisualSettings}
            exportConfig={exportConfig}
            setExportConfig={setExportConfig}
            isExportUnlocked={isExportUnlocked}
            onExport={onExport}
            onUnlockExport={onUnlockExport}
          />
        )}
      </section>
    </aside>
  );
}
