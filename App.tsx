
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeType, CountingMode, JaapState } from './types.ts';
import { THEMES, MALA_TARGET, BELL_SOUND_URL } from './constants.tsx';
import SpiritualQuote from './components/SpiritualQuote.tsx';

const TAP_SOUND_URL = 'https://www.soundjay.com/buttons/sounds/button-20.mp3';

const App: React.FC = () => {
  const [countState, setCountState] = useState<JaapState>(() => {
    const saved = localStorage.getItem('radha_jaap_state');
    return saved ? JSON.parse(saved) : { totalCount: 0, currentMalaCount: 0, malasCompleted: 0 };
  });

  const [themeType, setThemeType] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('radha_jaap_theme');
    return (saved as ThemeType) || ThemeType.SAFFRON;
  });

  const [mode, setMode] = useState<CountingMode>(() => {
    const saved = localStorage.getItem('radha_jaap_mode');
    return (saved as CountingMode) || CountingMode.MALA;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('radha_jaap_sound');
    return saved === null ? true : saved === 'true';
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const tapAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bellAudioRef.current = new Audio(BELL_SOUND_URL);
    tapAudioRef.current = new Audio(TAP_SOUND_URL);
    if (tapAudioRef.current) tapAudioRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    localStorage.setItem('radha_jaap_state', JSON.stringify(countState));
  }, [countState]);

  useEffect(() => {
    localStorage.setItem('radha_jaap_theme', themeType);
  }, [themeType]);

  useEffect(() => {
    localStorage.setItem('radha_jaap_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('radha_jaap_sound', String(soundEnabled));
  }, [soundEnabled]);

  const currentTheme = THEMES[themeType];

  const handleIncrement = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop ghost clicks on mobile
    if (e) {
      if ('preventDefault' in e) e.preventDefault();
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
    
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 100);

    if (soundEnabled && tapAudioRef.current) {
      tapAudioRef.current.currentTime = 0;
      tapAudioRef.current.play().catch(() => {});
    }

    setCountState(prev => {
      const newTotal = prev.totalCount + 1;
      const newCurrentMala = prev.currentMalaCount + 1;
      
      let newMalasCompleted = prev.malasCompleted;
      let finalCurrentMala = newCurrentMala;

      if (newCurrentMala === MALA_TARGET) {
        newMalasCompleted += 1;
        finalCurrentMala = 0;
        
        if (soundEnabled && bellAudioRef.current) {
          bellAudioRef.current.currentTime = 0;
          bellAudioRef.current.play().catch(e => console.error("Audio playback failed", e));
        }
      }

      return {
        totalCount: newTotal,
        currentMalaCount: finalCurrentMala,
        malasCompleted: newMalasCompleted
      };
    });
  }, [soundEnabled]);

  const handleReset = () => {
    setCountState({ totalCount: 0, currentMalaCount: 0, malasCompleted: 0 });
    setIsResetModalOpen(false);
  };

  const cycleTheme = () => {
    const themeValues = Object.values(ThemeType);
    const currentIndex = themeValues.indexOf(themeType);
    const nextIndex = (currentIndex + 1) % themeValues.length;
    setThemeType(themeValues[nextIndex]);
  };

  const progressPercentage = (countState.currentMalaCount / MALA_TARGET) * 100;

  return (
    <div 
      className="min-h-screen flex flex-col items-center p-4 transition-colors duration-700 overflow-x-hidden selection:bg-transparent"
      style={{ backgroundColor: currentTheme.background }}
    >
      <header className="w-full max-w-md flex justify-between items-center py-6">
        <div>
          <h1 className="hindi-heading text-4xl font-normal leading-tight" style={{ color: currentTheme.primary }}>श्री राधा</h1>
          <p className="hindi-script text-sm font-bold tracking-wide opacity-70" style={{ color: currentTheme.text }}>Jaap Counter</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-full shadow-lg transition-transform active:scale-90 bg-white"
            style={{ color: soundEnabled ? currentTheme.primary : '#999' }}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button onClick={cycleTheme} className="p-3 rounded-full shadow-lg transition-transform active:scale-90 bg-white" style={{ color: currentTheme.primary }}>
            <ThemeIcon />
          </button>
          <button onClick={() => setIsResetModalOpen(true)} className="p-3 rounded-full shadow-lg transition-transform active:scale-90 bg-white" style={{ color: currentTheme.accent }}>
            <ResetIcon />
          </button>
        </div>
      </header>

      <div className="w-full max-w-md flex justify-center mb-6">
        <div className="p-1 rounded-2xl flex gap-1 bg-black/5">
          <button 
            onClick={() => setMode(CountingMode.MALA)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === CountingMode.MALA ? 'bg-white shadow-sm' : 'opacity-40'}`}
            style={{ color: mode === CountingMode.MALA ? currentTheme.primary : currentTheme.text }}
          >
            माला (108)
          </button>
          <button 
            onClick={() => setMode(CountingMode.UNLIMITED)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === CountingMode.UNLIMITED ? 'bg-white shadow-sm' : 'opacity-40'}`}
            style={{ color: mode === CountingMode.UNLIMITED ? currentTheme.primary : currentTheme.text }}
          >
            असीमित
          </button>
        </div>
      </div>

      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-6 py-4">
        <div className="text-center">
          <span className="text-7xl font-black tabular-nums transition-all duration-300" style={{ color: currentTheme.text }}>
            {countState.totalCount.toLocaleString()}
          </span>
          <div className="mt-2">
            <span className="hindi-script text-lg font-bold opacity-60" style={{ color: currentTheme.text }}>
              {mode === CountingMode.MALA ? 'कुल जाप' : 'अनंत जाप'}
            </span>
          </div>
        </div>

        <button
          onPointerDown={handleIncrement}
          className={`w-64 h-64 md:w-72 md:h-72 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-75 active:scale-90 relative overflow-hidden z-10 select-none touch-none ${isVibrating ? 'scale-95 brightness-110' : 'scale-100'}`}
          style={{ backgroundColor: currentTheme.primary }}
        >
          <span className="hindi-heading text-6xl md:text-7xl text-white drop-shadow-lg pointer-events-none">राधा</span>
          <span className="hindi-heading text-6xl md:text-7xl text-white drop-shadow-lg -mt-4 pointer-events-none">राधा</span>
          <span className="text-white/60 text-[10px] mt-4 tracking-widest uppercase font-black pointer-events-none">Tap Bead</span>
        </button>

        {mode === CountingMode.MALA && (
          <div className="w-full bg-white/40 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="hindi-script text-sm font-bold opacity-60" style={{ color: currentTheme.text }}>माला पूर्ण</p>
                <p className="text-3xl font-black" style={{ color: currentTheme.primary }}>{countState.malasCompleted}</p>
              </div>
              <div className="text-right">
                <p className="hindi-script text-xs font-bold opacity-40 uppercase" style={{ color: currentTheme.text }}>वर्तमान माला</p>
                <p className="text-lg font-bold" style={{ color: currentTheme.text }}>{countState.currentMalaCount} / {MALA_TARGET}</p>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${progressPercentage}%`, backgroundColor: currentTheme.primary }}></div>
            </div>
          </div>
        )}

        <SpiritualQuote theme={currentTheme} />
      </main>

      <footer className="w-full max-w-md py-4 text-center">
        <p className="hindi-script text-xs font-bold tracking-widest uppercase opacity-40" style={{ color: currentTheme.text }}>
          Developed with Devotion • {mode === CountingMode.MALA ? '१०८ जाप = १ माला' : 'असीमित जाप मोड'}
        </p>
      </footer>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl">
            <h3 className="hindi-heading text-2xl font-normal text-gray-900 mb-2">रीसेट करें?</h3>
            <p className="text-gray-500 text-sm mb-6">This will clear your total count of {countState.totalCount} jaaps.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 active:scale-95 transition-transform">रद्द करें</button>
              <button onClick={handleReset} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 active:scale-95 transition-transform">रीसेट</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const ResetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
const SoundOnIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const SoundOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>;

export default App;
