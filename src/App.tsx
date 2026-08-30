/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import p5 from 'p5';
import { Lock, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mode, ProTab, Param, VisualSettings, ExportConfig } from './types';
import { 
  normalizeEquationInput, 
  extractParamsFromEquation, 
  validateAndComputeScale, 
  validateAllPresetEquations,
  translateMath 
} from './utils/mathParser';
import { exportWebM, easeInOutCubic, lerp } from './utils/exportRecorder';
import { Sidebar } from './components/sidebar/Sidebar';
import { MathCanvas } from './components/canvas/MathCanvas';
import { AppBanner } from './components/common/AppBanner';

export default function App() {
  const [mode, setMode] = useState<Mode>('muse');
  const [proTab, setProTab] = useState<ProTab>('calculus');
  const [isProUser, setIsProUser] = useState(false);
  const [matrix, setMatrix] = useState<number[][]>([[1, 0], [0, 1]]);
  
  const [rawInput, setRawInput] = useState('sqrt(x^2 - 1)');
  const [normalizedInput, setNormalizedInput] = useState('sqrt(x^2 - 1)');
  const [ghostEq, setGhostEq] = useState('sqrt(x^2 - 1)');
  const [params, setParams] = useState<Param[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  
  const [scaleVal, setScaleVal] = useState(50);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [isEditingScale, setIsEditingScale] = useState(false);
  const [tempScale, setTempScale] = useState('50');
  
  const [showPresets, setShowPresets] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    trails: false,
    glow: true,
    adaptiveTime: true,
    showRoots: true,
    show3DComplex: false
  });

  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    fps: 60,
    durationSec: 3,
    resScale: 1,
    easing: 'easeInOut',
    loop: 'none',
    from: -5,
    to: 5
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isExportPreview, setIsExportPreview] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pulse, setPulse] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation3D, setRotation3D] = useState({ x: 0.5, y: -0.5 });
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  const [isExportUnlocked, setIsExportUnlocked] = useState<boolean>(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);

  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(() => {
    return (localStorage.getItem('math_morph_sidebar_position') as 'left' | 'right') || 'left';
  });

  const toggleSidebarPosition = () => {
    setSidebarPosition(prev => {
      const next = prev === 'left' ? 'right' : 'left';
      localStorage.setItem('math_morph_sidebar_position', next);
      return next;
    });
  };

  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const p5Instance = useRef<p5 | null>(null);
  const cancelExportRef = useRef(false);

  // Check URL parameters for Stripe payment success (if applicable)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      setIsExportUnlocked(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleUnlockExport = () => {
    setShowComingSoonPopup(true);
  };

  // Smooth 3D Transition
  useEffect(() => {
    let animId: number;
    const target = (visualSettings.show3DComplex && mode === 'pro') ? 1 : 0;
    
    const updateTransition = () => {
      setTransitionProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.005) return target;
        return prev + diff * 0.08;
      });
      if (transitionProgress !== target) {
        animId = requestAnimationFrame(updateTransition);
      }
    };

    animId = requestAnimationFrame(updateTransition);
    return () => cancelAnimationFrame(animId);
  }, [visualSettings.show3DComplex, mode, transitionProgress]);

  // Validate all preset equations on initial load
  useEffect(() => {
    validateAllPresetEquations();
  }, []);

  // Update equation validation and parameters
  useEffect(() => {
    const norm = normalizeEquationInput(rawInput);
    setNormalizedInput(norm);

    const { isValid: valid, errorMsg: msg, suggestedScale } = validateAndComputeScale(rawInput, norm);
    setIsValid(valid);
    setErrorMsg(msg);

    if (suggestedScale) {
      setScaleVal(suggestedScale);
    }

    startTransition(() => {
      setParams(prev => extractParamsFromEquation(norm, prev));
    });
  }, [rawInput]);

  // Morphing animation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setParams(prev => {
        const anyMorphing = prev.some(p => p.isMorphing);
        if (!anyMorphing) return prev;

        return prev.map(p => {
          if (p.isMorphing) {
            const currentTarget = (p.targetVal !== undefined && Math.abs(p.val - p.targetVal) > 0.2) 
              ? p.targetVal 
              : (p.minRange !== undefined && p.maxRange !== undefined)
                ? p.minRange + Math.random() * (p.maxRange - p.minRange)
                : p.originalVal + (Math.random() * 20 - 10);
            
            const diff = currentTarget - p.val;
            const newVal = p.val + diff * 0.02;
            
            return { ...p, val: newVal, targetVal: currentTarget };
          }
          return p;
        });
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const toggleMorph = (idx: number) => {
    setParams(prev => prev.map((p, i) => {
      if (i === idx) {
        const isMorphing = !p.isMorphing;
        return {
          ...p,
          isMorphing,
          targetVal: isMorphing 
            ? ((p.minRange !== undefined && p.maxRange !== undefined) 
                ? p.minRange + Math.random() * (p.maxRange - p.minRange) 
                : p.originalVal + (Math.random() * 20 - 10)) 
            : undefined
        };
      }
      return p;
    }));
  };

  const stopAllAnimations = () => {
    cancelExportRef.current = true;
    setParams(prev => prev.map(p => ({ ...p, isMorphing: false })));
    setIsExporting(false);
    setIsExportPreview(false);
  };

  const updateParam = (idx: number, val: string) => {
    const v = parseFloat(val);
    setParams(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx].val = next[idx].role === 'exponent' ? Math.round(v) : v;
      }
      return next;
    });
  };

  const updateParamRange = (idx: number, type: 'min' | 'max', val: string) => {
    const v = parseFloat(val);
    if (!isNaN(v)) {
      setParams(prev => {
        const next = [...prev];
        if (next[idx]) {
          if (type === 'min') next[idx].minRange = v;
          else next[idx].maxRange = v;
        }
        return next;
      });
    }
  };

  const insertAtCursor = (text: string) => {
    const input = document.getElementById('eq-input') as HTMLInputElement;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const val = input.value;
      const nextVal = val.substring(0, start) + text + val.substring(end);
      setRawInput(nextVal);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setRawInput(prev => prev + text);
    }
  };

  const handleExport = async (isPreview = false) => {
    const effectiveActiveIdx = activeIdx !== null ? activeIdx : (params.length > 0 ? 0 : null);
    if (!canvasElementRef.current || effectiveActiveIdx === null) return;
    
    cancelExportRef.current = false;
    setIsExporting(true);
    setIsExportPreview(isPreview);
    setExportProgress(0);

    const originalScale = scaleVal;
    const originalParams = params.map(p => ({ ...p }));
    const { fps, durationSec, resScale, easing, loop } = exportConfig;
    const from = parseFloat(exportConfig.from as any) || 0;
    const to = parseFloat(exportConfig.to as any) || 0;
    
    const container = canvasRef.current!;
    const originalW = container.offsetWidth;
    const originalH = container.offsetHeight;
    
    if (!isPreview && resScale > 1) {
      p5Instance.current?.resizeCanvas(originalW * resScale, originalH * resScale);
      setScaleVal(originalScale * resScale);
    }

    let recorder: any = null;
    let stopped: Promise<Blob> | null = null;
    if (!isPreview) {
      const res = await exportWebM(canvasElementRef.current, fps);
      recorder = res.recorder;
      stopped = res.stopped;
    }

    const start = performance.now();
    const totalMs = durationSec * 1000;

    await new Promise<void>((resolve) => {
      function tick(now: number) {
        const elapsed = now - start;
        let rawT = Math.min(1, elapsed / totalMs);
        
        if (visualSettings.adaptiveTime) {
          const cps = [0, 0.25, 0.5, 0.75, 1];
          for (const cp of cps) {
            const d = rawT - cp;
            if (Math.abs(d) < 0.1) {
              const normalizedD = d / 0.1;
              const warpedD = Math.pow(Math.abs(normalizedD), 1.5) * Math.sign(normalizedD);
              rawT = cp + warpedD * 0.1;
              break;
            }
          }
        }

        setExportProgress(rawT * 100);

        if (cancelExportRef.current) {
          if (recorder) recorder.stop();
          resolve();
          return;
        }

        let t = rawT;
        if (easing === 'easeInOut') t = easeInOutCubic(rawT);

        let value: number;
        if (loop === 'ping-pong') {
          const phase = rawT * 2;
          const tt = phase <= 1 ? phase : 2 - phase;
          const eased = easing === 'easeInOut' ? easeInOutCubic(tt) : tt;
          value = lerp(from, to, eased);
        } else {
          value = lerp(from, to, t);
        }

        setParams(prev => {
          const finalValue = prev[effectiveActiveIdx].role === 'exponent' ? Math.round(value) : value;
          return prev.map((p, i) => i === effectiveActiveIdx ? { ...p, val: finalValue } : p);
        });

        if (rawT < 1) {
          requestAnimationFrame(tick);
        } else {
          if (recorder) recorder.stop();
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });

    if (!isPreview && stopped) {
      const blob = await stopped;
      
      if (resScale > 1) {
        p5Instance.current?.resizeCanvas(originalW, originalH);
        setScaleVal(originalScale);
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `math-morph-export-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setParams(originalParams);
    setIsExporting(false);
    setIsExportPreview(false);
    setExportProgress(0);
  };

  const handleApplyEquation = () => {
    setGhostEq(normalizedInput);
    const getActiveRaw = () => {
      const numRegex = /\d+(\.\d+)?|\bPI\b|\bE\b|\b(?![xy])[a-z]\b/gi;
      let i = 0;
      return normalizedInput.replace(numRegex, () => {
        const val = params[i]?.val ?? 0;
        i++;
        return val.toString();
      });
    };
    const translated = translateMath(getActiveRaw());
    if (translated) {
      setPulse(1.0);
    }
  };

  return (
    <div className="flex flex-col landscape:flex-row h-screen w-screen bg-[#111111] text-white font-sans overflow-hidden select-none">
      {/* Top Banner rendered above canvas in portrait mode only */}
      <div className="order-0 block landscape:hidden w-full flex-shrink-0 bg-panel-1 border-b border-white/5 px-4 pt-[max(env(safe-area-inset-top),28px)] pb-3 z-20 shadow-md">
        <AppBanner mode={mode} setMode={setMode} />
      </div>

      {/* Canvas in portrait mode (order-1), dynamic left or right in landscape mode */}
      <div className={`order-1 ${sidebarPosition === 'left' ? 'landscape:order-2' : 'landscape:order-1'} w-full landscape:flex-1 h-[40vh] sm:h-[45vh] md:h-[48vh] landscape:h-full flex-shrink-0 landscape:flex-shrink-0 min-w-0 min-h-0 overflow-hidden flex items-center justify-center`}>
        <div className="w-full h-full landscape:min-w-[100vh] flex-1 relative">
          <MathCanvas 
            scaleVal={scaleVal}
            setScaleVal={setScaleVal}
            ghostEq={ghostEq}
            normalizedInput={normalizedInput}
            params={params}
            mode={mode}
            showDerivative={showDerivative}
            showIntegral={showIntegral}
            isValid={isValid}
            offset={offset}
            setOffset={setOffset}
            rotation3D={rotation3D}
            setRotation3D={setRotation3D}
            visualSettings={visualSettings}
            pulse={pulse}
            setPulse={setPulse}
            transitionProgress={transitionProgress}
            matrix={matrix}
            proTab={proTab}
            isExporting={isExporting}
            isExportPreview={isExportPreview}
            exportProgress={exportProgress}
            exportConfig={exportConfig}
            showZoomHint={showZoomHint}
            setShowZoomHint={setShowZoomHint}
            isEditingScale={isEditingScale}
            setIsEditingScale={setIsEditingScale}
            tempScale={tempScale}
            setTempScale={setTempScale}
            canvasRef={canvasRef}
            canvasElementRef={canvasElementRef}
            p5Instance={p5Instance}
          />
        </div>
      </div>

      {/* Bottom scrollable controls panel in portrait mode, left or right sidebar in landscape mode */}
      <div className={`order-2 ${sidebarPosition === 'left' ? 'landscape:order-1' : 'landscape:order-2'} flex flex-col flex-1 landscape:flex-none w-full landscape:w-[280px] sm:landscape:w-[320px] md:landscape:w-[360px] lg:landscape:w-[400px] xl:landscape:w-[420px] landscape:flex-shrink-0 landscape:h-full min-h-0 overflow-hidden`}>
        <Sidebar 
          sidebarPosition={sidebarPosition}
          onToggleSidebarPosition={toggleSidebarPosition}
          mode={mode}
          setMode={setMode}
          isProUser={isProUser}
          setIsProUser={setIsProUser}
          proTab={proTab}
          setProTab={setProTab}
          rawInput={rawInput}
          setRawInput={setRawInput}
          normalizedInput={normalizedInput}
          params={params}
          activeIdx={activeIdx}
          isValid={isValid}
          errorMsg={errorMsg}
          showPresets={showPresets}
          setShowPresets={setShowPresets}
          showDerivative={showDerivative}
          setShowDerivative={setShowDerivative}
          showIntegral={showIntegral}
          setShowIntegral={setShowIntegral}
          visualSettings={visualSettings}
          setVisualSettings={setVisualSettings}
          matrix={matrix}
          setMatrix={setMatrix}
          exportConfig={exportConfig}
          setExportConfig={setExportConfig}
          showExportSettings={showExportSettings}
          setShowExportSettings={setShowExportSettings}
          isExporting={isExporting}
          exportProgress={exportProgress}
          isExportUnlocked={isExportUnlocked}
          onApplyEquation={handleApplyEquation}
          insertAtCursor={insertAtCursor}
          onSelectPreset={(presetVal) => {
            setRawInput(presetVal);
            setShowPresets(false);
          }}
          onResetGhost={() => setGhostEq(normalizedInput)}
          onTokenClick={(currentIdx) => {
            stopAllAnimations();
            if (activeIdx === currentIdx) {
              toggleMorph(currentIdx);
            } else {
              setActiveIdx(currentIdx);
            }
          }}
          onToggleMorph={toggleMorph}
          onUpdateParam={updateParam}
          onUpdateParamRange={updateParamRange}
          onExport={handleExport}
          onUnlockExport={handleUnlockExport}
        />
      </div>

      {/* Coming Soon Popup Modal */}
      <AnimatePresence>
        {showComingSoonPopup && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowComingSoonPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel-1 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4 relative"
            >
              <button
                onClick={() => setShowComingSoonPopup(false)}
                className="absolute top-3.5 right-3.5 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Coming soon.</h3>
              </div>

              <button
                onClick={() => setShowComingSoonPopup(false)}
                className="w-full py-2.5 px-4 bg-[#00d1ff] hover:bg-[#00d1ff]/90 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:shadow-[0_0_20px_rgba(0,209,255,0.5)]"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
