
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeType, CountingMode, JaapState } from './types.ts';
import { THEMES, MALA_TARGET, BELL_SOUND_URL } from './constants.tsx';
import SpiritualQuote from './components/SpiritualQuote.tsx';

const TAP_SOUND_URL = 'https://www.soundjay.com/buttons/sounds/button-20.mp3';

const App: React.FC = () => {
  const [countState, setCountState] = useState<JaapState>(() => {
    try {
      const saved = localStorage.getItem('radha_jaap_state');
      return saved ? JSON.parse(saved) : { totalCount: 0, currentMalaCount: 0, malasCompleted: 0 };
    } catch (e) {
      return { totalCount: 0, currentMalaCount: 0, malasCompleted: 0 };
    }
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const tapAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bellAudioRef.current = new Audio(BELL_SOUND_URL);
    tapAudioRef.current = new Audio(TAP_SOUND_URL);
    if (tapAudioRef.current) tapAudioRef.current.volume = 0.2;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    localStorage.setItem('radha_jaap_state', JSON.stringify(countState));
  }, [countState]);

  useEffect(() => {
    localStorage.setItem('radha_jaap_theme', themeType);
  }, [themeType]);

  useEffect(() => {
    localStorage.setItem('radha_jaap_mode', mode);
    localStorage.setItem('radha_jaap_sound', String(soundEnabled));
  }, [mode, soundEnabled]);

  const currentTheme = THEMES[themeType];

  const handleIncrement = useCallback((e?: React.PointerEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setActiveTab(true);
    setTimeout(() => setActiveTab(false), 100);

    if (soundEnabled && tapAudioRef.current) {
      tapAudioRef.current.currentTime = 0;
      tapAudioRef.current.play().catch(() => {});
    }

    setCountState(prev => {
      const newTotal = prev.totalCount + 1;
      const newCurrentMala = prev.currentMalaCount + 1;
      
      let newMalasCompleted = prev.malasCompleted;
      let finalCurrentMala = newCurrentMala;

      if (mode === CountingMode.MALA && newCurrentMala >= MALA_TARGET) {
        newMalasCompleted += 1;
        finalCurrentMala = 0;
        
        if (soundEnabled && bellAudioRef.current) {
          bellAudioRef.current.currentTime = 0;
          bellAudioRef.current.play().catch(() => {});
        }
      }

      return {
        totalCount: newTotal,
        currentMalaCount: finalCurrentMala,
        malasCompleted: newMalasCompleted
      };
    });
  }, [soundEnabled, mode]);

  const handleShareSystem = async () => {
    const shareText = `राधे राधे! आज मैंने श्री राधा नाम का ${countState.totalCount} बार जाप किया। आप भी इस सुंदर 'राधा नाम जाप' ऐप का उपयोग करें: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'राधा नाम जाप',
          text: shareText,
          url: window.location.origin,
        });
        setIsShareModalOpen(false);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `राधे राधे! आज मैंने श्री राधा नाम का ${countState.totalCount} बार जाप किया। आप भी इस सुंदर 'राधा नाम जाप' ऐप का उपयोग करें: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setIsShareModalOpen(false);
  };

  const shareViaEmail = () => {
    const subject = `राधा नाम जाप - आध्यात्मिक अनुभव`;
    const body = `राधे राधे!\n\nआज मैंने श्री राधा नाम का ${countState.totalCount} बार जाप किया। आप भी इस सुंदर 'राधा नाम जाप' ऐप का उपयोग करें और राधा रानी की भक्ति में लीन हों।\n\nऐप लिंक: ${window.location.origin}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setIsShareModalOpen(false);
  };

  // Fix: Added missing handleReset function to reset counts and close modal
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
      className="min-h-screen flex flex-col items-center p-4 transition-colors duration-1000 overflow-x-hidden"
      style={{ backgroundColor: currentTheme.background }}
    >
      <header className="w-full max-w-md flex justify-between items-center py-6">
        <div className="flex flex-col">
          <h1 className="hindi-heading text-4xl font-normal leading-tight" style={{ color: currentTheme.primary }}>श्री राधा</h1>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 -mt-1" style={{ color: currentTheme.text }}>Vrindavan Dhama</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleShareSystem}
            className="p-3 rounded-full shadow-lg transition-all active:scale-90 bg-white/80 backdrop-blur-sm"
            style={{ color: currentTheme.primary }}
          >
            <ShareIcon />
          </button>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-full shadow-lg transition-all active:scale-90 bg-white/80 backdrop-blur-sm"
            style={{ color: soundEnabled ? currentTheme.primary : '#ccc' }}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button onClick={cycleTheme} className="p-3 rounded-full shadow-lg transition-all active:scale-90 bg-white/80 backdrop-blur-sm" style={{ color: currentTheme.primary }}>
            <ThemeIcon />
          </button>
          <button onClick={() => setIsResetModalOpen(true)} className="p-3 rounded-full shadow-lg transition-all active:scale-90 bg-white/80 backdrop-blur-sm" style={{ color: currentTheme.accent }}>
            <ResetIcon />
          </button>
        </div>
      </header>

      <div className="w-full max-w-md flex justify-center mb-8">
        <div className="p-1 rounded-2xl flex gap-1 bg-black/5 backdrop-blur-sm">
          <button 
            onClick={() => setMode(CountingMode.MALA)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === CountingMode.MALA ? 'bg-white shadow-sm scale-105' : 'opacity-40'}`}
            style={{ color: mode === CountingMode.MALA ? currentTheme.primary : currentTheme.text }}
          >
            माला (108)
          </button>
          <button 
            onClick={() => setMode(CountingMode.UNLIMITED)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === CountingMode.UNLIMITED ? 'bg-white shadow-sm scale-105' : 'opacity-40'}`}
            style={{ color: mode === CountingMode.UNLIMITED ? currentTheme.primary : currentTheme.text }}
          >
            असीमित
          </button>
        </div>
      </div>

      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-between py-2">
        <div className="text-center">
          <h2 className="text-7xl font-black tabular-nums transition-all duration-300 tracking-tighter" style={{ color: currentTheme.text }}>
            {countState.totalCount.toLocaleString()}
          </h2>
          <div className="mt-1">
            <span className="hindi-script text-xl font-bold opacity-60" style={{ color: currentTheme.text }}>
              कुल सुमिरन
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center py-8">
          <div className="absolute inset-0 rounded-full border-2 border-dashed opacity-20 animate-[spin_20s_linear_infinite]" style={{ borderColor: currentTheme.primary }}></div>
          <div className="absolute inset-4 rounded-full border border-dashed opacity-10 animate-[spin_15s_linear_infinite_reverse]" style={{ borderColor: currentTheme.primary }}></div>

          <button
            onPointerDown={handleIncrement}
            className={`w-64 h-64 md:w-72 md:h-72 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center transition-all duration-75 active:scale-95 relative overflow-hidden z-10 select-none touch-none pulse-button ${activeTab ? 'brightness-125 scale-95' : ''}`}
            style={{ backgroundColor: currentTheme.primary }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
            <span className="hindi-heading text-7xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] pointer-events-none">राधा</span>
            <span className="hindi-heading text-7xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] -mt-6 pointer-events-none">राधा</span>
            <span className="text-white/40 text-[9px] mt-6 tracking-[0.3em] uppercase font-black pointer-events-none">Tap to Chant</span>
          </button>
        </div>

        {mode === CountingMode.MALA && (
          <div className="w-full bg-white/50 rounded-3xl p-6 shadow-sm backdrop-blur-xl border border-white/20">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="hindi-script text-sm font-bold opacity-60" style={{ color: currentTheme.text }}>माला पूर्ण</p>
                <p className="text-4xl font-black" style={{ color: currentTheme.primary }}>{countState.malasCompleted}</p>
              </div>
              <div className="text-right">
                <p className="hindi-script text-xs font-bold opacity-40 uppercase" style={{ color: currentTheme.text }}>वर्तमान माला</p>
                <p className="text-lg font-bold" style={{ color: currentTheme.text }}>{countState.currentMalaCount} <span className="opacity-30">/</span> {MALA_TARGET}</p>
              </div>
            </div>
            <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 rounded-full bg-gradient-to-r" style={{ width: `${progressPercentage}%`, backgroundColor: currentTheme.primary }}></div>
            </div>
          </div>
        )}

        <div className="w-full px-2">
          <SpiritualQuote theme={currentTheme} />
        </div>
      </main>

      <footer className="w-full max-w-md py-6 text-center">
        <p className="hindi-script text-[10px] font-bold tracking-[0.2em] uppercase opacity-30" style={{ color: currentTheme.text }}>
          ॥ राधा रानी की जय ॥
        </p>
      </footer>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-2xl scale-in-center">
            <h3 className="hindi-heading text-3xl font-normal text-gray-900 mb-2">मिटा दें?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">क्या आप अपनी अब तक की {countState.totalCount} जाप की गणना को हटाना चाहते हैं?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleReset} className="w-full py-4 rounded-2xl font-bold text-white bg-red-500 active:scale-95 transition-all shadow-lg shadow-red-200">हाँ, रीसेट करें</button>
              <button onClick={() => setIsResetModalOpen(false)} className="w-full py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 active:scale-95 transition-all">नहीं, रहने दें</button>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-2xl scale-in-center">
            <h3 className="hindi-heading text-3xl font-normal text-gray-900 mb-6">शेयर करें</h3>
            <div className="flex flex-col gap-3">
              <button onClick={shareViaWhatsApp} className="w-full py-4 rounded-2xl font-bold text-white bg-[#25D366] flex items-center justify-center gap-3 shadow-lg">
                <WhatsAppIcon /> WhatsApp
              </button>
              <button onClick={shareViaEmail} className="w-full py-4 rounded-2xl font-bold text-white bg-[#DB4437] flex items-center justify-center gap-3 shadow-lg">
                <EmailIcon /> Email / Gmail
              </button>
              <button onClick={() => setIsShareModalOpen(false)} className="w-full py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 mt-4">बंद करें</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WhatsAppIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.109.004.253-.041.397.308.145.348.491 1.2.535 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>;
const EmailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const ThemeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const ResetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
const SoundOnIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const SoundOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;

export default App;
