import React, { useState, useEffect } from 'react';
import escalaLogo from '../assets/images/logoescala1.jpg';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Sparkles, 
  Eye, 
  Award, 
  X, 
  PhoneCall, 
  ArrowLeft, 
  Calendar,
  LockKeyhole
} from 'lucide-react';
import { db } from '../services/db';

// HIGH-FIDELITY SVG INSIGNIA COMPONENT matching the military coat of arms from the attachment
const EscalaInsignia: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 220 }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 400 490" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
      >
        <defs>
          {/* Gorgeous Metallic Golden Gradients */}
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4D0" />
            <stop offset="30%" stopColor="#E5BA5D" />
            <stop offset="70%" stopColor="#A87F2A" />
            <stop offset="100%" stopColor="#553D0A" />
          </linearGradient>
          <linearGradient id="gold-bright" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FCD373" />
            <stop offset="80%" stopColor="#B38A30" />
            <stop offset="100%" stopColor="#735312" />
          </linearGradient>
          {/* Tactical Military Olive-Green Gradients matching the image */}
          <linearGradient id="helmet-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9EBA8D" />
            <stop offset="40%" stopColor="#4D6643" />
            <stop offset="75%" stopColor="#25351E" />
            <stop offset="100%" stopColor="#121D0E" />
          </linearGradient>
          <linearGradient id="calendar-plate-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2F4229" />
            <stop offset="100%" stopColor="#0B130A" />
          </linearGradient>
          {/* Text metallic gradient blending military green and warm gold */}
          <linearGradient id="gold-text-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D9ECD0" />
            <stop offset="35%" stopColor="#9EB88D" />
            <stop offset="70%" stopColor="#5D784C" />
            <stop offset="100%" stopColor="#1E2B15" />
          </linearGradient>
          {/* Deep dark radial gradient for shield body */}
          <radialGradient id="shield-bg" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#0D160E" />
            <stop offset="70%" stopColor="#050805" />
            <stop offset="100%" stopColor="#010201" />
          </radialGradient>
        </defs>

        {/* 1. 3D Faceted Gold Star at the top */}
        <g id="star-3d">
          {/* Top Point */}
          <path d="M200,60 L200,18 L211,44 Z" fill="#E5BA5D" />
          <path d="M200,60 L200,18 L189,44 Z" fill="#FFF2BF" />
          {/* Right-Top Point */}
          <path d="M200,60 L238,46 L211,44 Z" fill="#FFF2BF" />
          <path d="M200,60 L238,46 L214,71 Z" fill="#D4AA4D" />
          {/* Right-Bottom Point */}
          <path d="M200,60 L224,90 L214,71 Z" fill="#FFF2BF" />
          <path d="M200,60 L224,90 L200,73 Z" fill="#C59A3D" />
          {/* Left-Bottom Point */}
          <path d="M200,60 L176,90 L200,73 Z" fill="#FFF2BF" />
          <path d="M200,60 L176,90 L186,71 Z" fill="#C59A3D" />
          {/* Left-Top Point */}
          <path d="M200,60 L162,46 L186,71 Z" fill="#FFF2BF" />
          <path d="M200,60 L162,46 L189,44 Z" fill="#D4AA4D" />
        </g>

        {/* 2. Outer Shield Body */}
        <path 
          d="M200,85 C295,85 345,110 345,200 C345,300 200,370 200,385 C200,370 55,300 55,200 C55,110 105,85 200,85 Z" 
          fill="url(#shield-bg)" 
          stroke="url(#gold-grad)" 
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Inner Border */}
        <path 
          d="M200,98 C278,98 322,120 322,200 C322,285 200,350 200,363 C200,350 78,285 78,200 C78,120 122,98 200,98 Z" 
          stroke="url(#gold-grad)" 
          strokeWidth="2"
          strokeOpacity="0.75"
          fill="none"
        />

        {/* 3. Military Combat Helmet inside (Upper half) in green/olive */}
        <g transform="translate(145, 115)">
          {/* Helmet dome */}
          <path 
            d="M15,55 C15,18 38,8 55,8 C72,8 95,18 95,55 C95,58 92,60 85,60 C55,60 55,60 25,60 C18,60 15,58 15,55 Z" 
            fill="url(#helmet-grad)" 
            opacity="0.95"
            stroke="url(#gold-grad)"
            strokeWidth="1.5"
          />
          {/* Helmet visor/rim */}
          <path 
            d="M10,55 L100,55 C105,55 105,62 100,62 L10,62 C5,62 5,55 10,55 Z" 
            fill="url(#gold-grad)" 
          />
          {/* Helmet strap */}
          <path 
            d="M33,62 L55,73 L77,62" 
            stroke="url(#gold-grad)" 
            strokeWidth="3.5" 
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 4. Calendar Matrix inside (Lower half) with Green active squares */}
        <g transform="translate(130, 205)">
          {/* Calendar Plate (Green) */}
          <rect 
            x="0" 
            y="0" 
            width="140" 
            height="92" 
            rx="12" 
            fill="url(#calendar-plate-grad)" 
            stroke="url(#gold-grad)" 
            strokeWidth="3.5" 
          />
          {/* Binders (Spiral effects) */}
          <rect x="25" y="-7" width="8" height="11" rx="3.5" fill="url(#gold-bright)" />
          <rect x="66" y="-7" width="8" height="11" rx="3.5" fill="url(#gold-bright)" />
          <rect x="107" y="-7" width="8" height="11" rx="3.5" fill="url(#gold-bright)" />

          {/* Tactical green active squares matching the upload */}
          <rect x="16" y="16" width="20" height="13" rx="2.5" fill="#4ADE80" fillOpacity="0.85" />
          <rect x="44" y="16" width="20" height="13" rx="2.5" fill="#22C55E" fillOpacity="0.5" />
          <rect x="72" y="16" width="20" height="13" rx="2.5" fill="#15803D" fillOpacity="0.35" />
          <rect x="100" y="16" width="20" height="13" rx="2.5" fill="#4ADE80" fillOpacity="0.9" />
          
          <rect x="16" y="35" width="20" height="13" rx="2.5" fill="#15803D" fillOpacity="0.3" />
          <rect x="44" y="35" width="20" height="13" rx="2.5" fill="#4ADE80" fillOpacity="0.9" />
          <rect x="72" y="35" width="20" height="13" rx="2.5" fill="#22C55E" fillOpacity="0.7" />
          <rect x="100" y="35" width="20" height="13" rx="2.5" fill="#15803D" fillOpacity="0.3" />
          
          <rect x="16" y="54" width="20" height="13" rx="2.5" fill="#064E3B" fillOpacity="0.2" />
          <rect x="44" y="54" width="20" height="13" rx="2.5" fill="#15803D" fillOpacity="0.4" />
          <rect x="72" y="54" width="20" height="13" rx="2.5" fill="#4ADE80" fillOpacity="0.9" />
          <rect x="100" y="54" width="20" height="13" rx="2.5" fill="#22C55E" fillOpacity="0.8" />
          
          <line x1="15" y1="78" x2="125" y2="78" stroke="url(#gold-grad)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
        </g>

        {/* 5. Rank Chevrons pointing UP, wrapping shield bottom (Green/olive with gold outline) */}
        <g id="chevrons-up" transform="translate(0, 0)">
          {/* Chevron 1 */}
          <path 
            d="M170,412 L200,394 L230,412 L230,404 L200,386 L170,404 Z" 
            fill="url(#helmet-grad)" 
            stroke="url(#gold-grad)"
            strokeWidth="1.2"
          />
          {/* Chevron 2 */}
          <path 
            d="M162,424 L200,402 L238,424 L238,416 L200,394 L162,416 Z" 
            fill="url(#helmet-grad)" 
            stroke="url(#gold-grad)"
            strokeWidth="1.2"
          />
          {/* Chevron 3 */}
          <path 
            d="M154,436 L200,410 L246,436 L246,428 L200,402 L154,428 Z" 
            fill="url(#helmet-grad)" 
            stroke="url(#gold-grad)"
            strokeWidth="1.2"
          />
        </g>

        {/* 6. Integrated ESCALA+ Text at the bottom with 3D Bevel/Outline */}
        <text 
          x="200" 
          y="480" 
          textAnchor="middle" 
          fill="url(#gold-text-grad)" 
          stroke="url(#gold-grad)"
          strokeWidth="1"
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="40" 
          fontWeight="900" 
          letterSpacing="4"
          className="font-black"
          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.65))' }}
        >
          ESCALA+
        </text>
      </svg>
    </div>
  );
};

interface LoginProps {
  onLogin: (role: 'admin' | 'guest' | 'aprovisionadora') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('marcosdamersimas@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [loginType, setLoginType] = useState<'admin' | 'aprovisionadora'>('admin');
  const [loading, setLoading] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingAprov, setLoadingAprov] = useState(false);
  const [showRealScales, setShowRealScales] = useState(false);
  const [animationState, setAnimationState] = useState<'splash' | 'ready'>('splash');
  const [splashPhase, setSplashPhase] = useState<'intro-sequence' | 'disintegrate' | 'done'>('intro-sequence');
  const [showLoginForm, setShowLoginForm] = useState(false);

  const realScales = db.funcoes.getAll();

  useEffect(() => {
    // 1. At 10.0s (10000ms), start the disintegration particle effect to match the logo wind-blow start
    const timerDisintegrate = setTimeout(() => {
      setSplashPhase('disintegrate');
    }, 10000);

    // 2. At 12.0s (12000ms), the logo is completely disintegrated, transition to selection screen
    const timerReady = setTimeout(() => {
      setSplashPhase('done');
      setAnimationState('ready');
    }, 12000);

    return () => {
      clearTimeout(timerDisintegrate);
      clearTimeout(timerReady);
    };
  }, []);

  // Generate disintegration particles for disintegration phase
  const particles = React.useMemo(() => {
    if (splashPhase !== 'disintegrate') return [];
    return Array.from({ length: 80 }).map((_, i) => {
      const angle = (Math.random() * 90 - 45) * Math.PI / 180; // drift biased to the right and up
      const speed = Math.random() * 180 + 80; // distance to travel
      const size = Math.random() * 4.5 + 2; // size in px
      const delay = Math.random() * 0.5; // staggered start
      const duration = Math.random() * 1.3 + 0.5; // individual lifetime
      const xStart = (Math.random() - 0.5) * 160; // scatter around center
      const yStart = (Math.random() - 0.5) * 160;
      const xEnd = xStart + Math.cos(angle) * speed + 120;
      const yEnd = yStart + Math.sin(angle) * speed - 160;

      return {
        id: i,
        style: {
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          left: `calc(50% + ${xStart}px)`,
          top: `calc(50% + ${yStart}px)`,
          '--tx': `${xEnd - xStart}px`,
          '--ty': `${yEnd - yStart}px`,
          animation: `crumble-particle ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s forwards`,
          pointerEvents: 'none',
          zIndex: 60,
        } as any
      };
    });
  }, [splashPhase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(loginType);
    }, 600);
  };

  const handleAprovisionadoraLogin = () => {
    setLoadingAprov(true);
    setTimeout(() => {
      setLoadingAprov(false);
      onLogin('aprovisionadora');
    }, 500);
  };

  const handleGuestLogin = () => {
    setLoadingGuest(true);
    setTimeout(() => {
      setLoadingGuest(false);
      onLogin('guest');
    }, 500);
  };

  return (
    <div id="login-page-wrapper" className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#121910] via-[#090d08] to-[#040604] text-slate-100 p-6 overflow-hidden transition-colors duration-200">
      
      {/* Inject custom CSS animations for high-craft visual fidelity */}
      <style>{`
        @keyframes logo-lifecycle {
          0% {
            opacity: 0;
            transform: scale(0.9);
            filter: blur(4px) brightness(1);
          }
          /* 1.8s - Fade in finishes */
          15% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px) brightness(1);
          }
          /* 3.6s - trough of blink 1 */
          30% {
            opacity: 0.15;
          }
          /* 5.4s - peak of blink 1 */
          45% {
            opacity: 1;
          }
          /* 7.2s - trough of blink 2 */
          60% {
            opacity: 0.15;
          }
          /* 9.0s - peak of blink 2. Finishes beautifully on opacity 1 */
          75% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px) brightness(1) drop-shadow(0 0 0 rgba(229, 186, 93, 0));
          }
          /* 10.0s - Stays static solid on screen, then starts disintegrating */
          83.33% {
            opacity: 1;
            transform: scale(1) translate(0, 0) rotate(0deg);
            filter: blur(0px) brightness(1) drop-shadow(0 0 0 rgba(229, 186, 93, 0));
          }
          /* 10.4s - initial wind drift */
          86.66% {
            transform: scale(1.02) translate(15px, -10px) rotate(0.5deg);
            filter: blur(3px) brightness(1.4) drop-shadow(0 0 20px rgba(229, 186, 93, 0.7));
            opacity: 0.95;
          }
          /* 12.0s - completely blown away by the wind */
          100% {
            transform: scale(0.75) translate(320px, -240px) rotate(12deg);
            filter: blur(28px) brightness(3) drop-shadow(0 0 60px rgba(229, 186, 93, 1));
            opacity: 0;
          }
        }

        @keyframes crumble-particle {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0;
            background-color: #E5BA5D;
            box-shadow: 0 0 6px #E5BA5D, 0 0 12px #B38A30;
          }
          15% {
            opacity: 1;
            transform: translate(0, 0) scale(1.4) rotate(45deg);
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0.1) rotate(360deg);
            opacity: 0;
            background-color: #B38A30;
          }
        }

        @keyframes ready-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-logo-lifecycle {
          animation: logo-lifecycle 12s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .animate-ready-fade-in {
          animation: ready-fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* BACKGROUND TOPOGRAPHIC LINES TEXTURE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M -100,150 Q 200,50 400,200 T 900,100 T 1400,300 T 1900,150" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.25" />
          <path d="M -100,180 Q 200,80 400,230 T 900,130 T 1400,330 T 1900,180" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.2" />
          <path d="M -100,210 Q 200,110 400,260 T 900,160 T 1400,360 T 1900,210" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.15" />
          
          <path d="M -100,450 Q 300,300 600,480 T 1200,320 T 1700,520 T 2000,400" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.18" />
          <path d="M -100,480 Q 300,330 600,510 T 1200,350 T 1700,550 T 2000,430" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.12" />

          <path d="M 100,750 Q 500,600 800,780 T 1400,620 T 1900,820" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.2" />
          <path d="M 100,780 Q 500,630 800,810 T 1400,650 T 1900,850" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* MILITARY TACTICAL MAP WATERMARK */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <svg className="w-full h-full opacity-18" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tactical Grid Lines */}
          <line x1="100" y1="0" x2="100" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="250" y1="0" x2="250" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />
          <line x1="400" y1="0" x2="400" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="550" y1="0" x2="550" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />
          <line x1="700" y1="0" x2="700" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="850" y1="0" x2="850" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />

          <line x1="0" y1="150" x2="1000" y2="150" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="0" y1="300" x2="1000" y2="300" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />
          <line x1="0" y1="450" x2="1000" y2="450" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="0" y1="600" x2="1000" y2="600" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />
          <line x1="0" y1="750" x2="1000" y2="750" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" strokeOpacity="0.3" />
          <line x1="0" y1="900" x2="1000" y2="900" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />

          {/* Tactical Target Range Circles */}
          <circle cx="500" cy="500" r="150" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="3,6" strokeOpacity="0.4" />
          <circle cx="500" cy="500" r="300" stroke="#E5BA5D" strokeWidth="0.5" strokeOpacity="0.25" />
          <circle cx="500" cy="500" r="450" stroke="#E5BA5D" strokeWidth="0.75" strokeDasharray="10,15" strokeOpacity="0.15" />
          
          {/* Tactical Map Contours (Watermark Shoreline & Islands) */}
          <path d="M 150,120 Q 220,180 300,100 T 500,220 T 720,140 T 900,260" fill="none" stroke="#E5BA5D" strokeWidth="1" strokeOpacity="0.35" />
          <path d="M 120,620 Q 280,500 450,700 T 780,550 T 950,720" fill="none" stroke="#E5BA5D" strokeWidth="1" strokeOpacity="0.3" />
          <path d="M 220,350 Q 280,310 320,380 T 450,330 T 550,420" fill="none" stroke="#E5BA5D" strokeWidth="0.75" strokeOpacity="0.2" />
          
          {/* Outpost Pointers */}
          <polygon points="500,490 505,505 495,505" fill="#E5BA5D" fillOpacity="0.4" />
          <text x="512" y="503" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fontWeight="bold" fillOpacity="0.5">HQ-SECURE</text>
          
          <polygon points="250,290 255,305 245,305" fill="#E5BA5D" fillOpacity="0.3" />
          <text x="262" y="303" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.4">ALPHA-1</text>
          
          <polygon points="700,590 705,605 695,605" fill="#E5BA5D" fillOpacity="0.3" />
          <text x="712" y="603" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.4">BRAVO-2</text>
          
          {/* Coordinates text */}
          <text x="410" y="28" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.5">34°45'12" N</text>
          <text x="860" y="145" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.5">12°09'54" W</text>
          <text x="15" y="595" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.5">GRID UT-4</text>
          <text x="715" y="895" fill="#E5BA5D" fontSize="10" fontFamily="monospace" fillOpacity="0.5">ALT-1200m</text>
        </svg>
      </div>

      {/* ==================== INTRO SPLASH SCREEN ==================== */}
      {animationState === 'splash' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={escalaLogo} 
              alt="Escala+" 
              className="w-[270px] h-[270px] md:w-[320px] md:h-[320px] object-contain rounded-2xl animate-logo-lifecycle" 
              referrerPolicy="no-referrer"
            />
            
            {/* Disintegration particles */}
            {particles.map((p) => (
              <div key={p.id} style={p.style} />
            ))}
          </div>
        </div>
      )}

      {/* ==================== TWO ROUNDED SQUARES SELECTION / CREDENTIAL FORM ==================== */}
      {animationState === 'ready' && (
        <div className="max-w-4xl w-full z-10 animate-ready-fade-in flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
          
          <div className="relative w-full flex items-center justify-center">
            
            {/* SELECTION SCREEN: THREE CARDS GRID */}
            <div 
              className={`w-full transition-all duration-[800ms] ease-in-out transform ${
                !showLoginForm 
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 scale-95 -translate-y-8 pointer-events-none absolute'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                
                {/* CARD 1: GESTOR DE ESCALA (ADMIN) */}
                <div 
                  id="card-sistema-escala"
                  onClick={() => {
                    setLoginType('admin');
                    setEmail('marcosdamersimas@gmail.com');
                    setShowLoginForm(true);
                  }}
                  className="group relative h-52 bg-[#070b08]/60 backdrop-blur-md border border-[#E5BA5D]/30 hover:border-[#E5BA5D]/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[#E5BA5D]/15 p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-[500ms] ease-out hover:-translate-y-2"
                >
                  <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-[#E5BA5D]/50 to-transparent group-hover:via-[#E5BA5D] transition-colors duration-500 rounded-full" />

                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[#E5BA5D] flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2BF] to-[#E5BA5D] uppercase tracking-wide">
                      Gestor de Escala
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-snug">
                      Acesso completo ao gerenciamento, escalas e destinos
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/80">
                    Painel do Gestor
                  </span>
                </div>

                {/* CARD 2: APROVISIONADORA (ASP OF STRIEDER) */}
                <div 
                  id="card-aprovisionadora"
                  onClick={() => {
                    setLoginType('aprovisionadora');
                    setEmail('strieder@eb.mil.br');
                    setShowLoginForm(true);
                  }}
                  className="group relative h-52 bg-[#070b08]/60 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-emerald-500/15 p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-[500ms] ease-out hover:-translate-y-2"
                >
                  <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent group-hover:via-emerald-400 transition-colors duration-500 rounded-full" />

                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D2FFD2] to-emerald-400 uppercase tracking-wide">
                      Aprovisionadora
                    </h3>
                    <p className="text-[11px] text-emerald-200/80 font-bold leading-snug">
                      Asp Of Strieder
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Leitura, Assinatura e Impressão
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
                    Acesso Aprovisionadora
                  </span>
                </div>

                {/* CARD 3: PRÉVIA DA ESCALA (VISITANTE) */}
                <div 
                  id="card-previa-escala"
                  onClick={handleGuestLogin}
                  className="group relative h-52 bg-[#070b08]/60 backdrop-blur-md border border-slate-700 hover:border-slate-400/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-slate-500/15 p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-[500ms] ease-out hover:-translate-y-2"
                >
                  <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-slate-500/50 to-transparent group-hover:via-slate-300 transition-colors duration-500 rounded-full" />

                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
                    {loadingGuest ? (
                      <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Eye className="w-6 h-6" />
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-black text-slate-200 uppercase tracking-wide">
                      Prévia de escala
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-snug">
                      Consulta pública de postos e mapas diários
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    Consulta Visitante
                  </span>
                </div>

              </div>
            </div>

            {/* CREDENTIALS FORM CONTAINER */}
            <div 
              className={`w-full max-w-md transition-all duration-[800ms] ease-in-out transform ${
                showLoginForm 
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 scale-95 translate-y-8 pointer-events-none absolute'
              }`}
            >
              <div className="bg-[#070b08]/85 backdrop-blur-md border border-[#E5BA5D]/35 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
                {/* Modern Accent Top Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#865F15] via-[#E5BA5D] to-[#FFF2BF]" />

                {/* Back to Selection button */}
                <button 
                  onClick={() => setShowLoginForm(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors mb-1 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Voltar à seleção</span>
                </button>

                {/* Header Form */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 shadow-lg ${
                    loginType === 'admin' 
                      ? 'bg-amber-950/80 border border-amber-500/50 text-amber-400' 
                      : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                  }`}>
                    {loginType === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-white uppercase">
                    {loginType === 'admin' ? 'Painel do Gestor' : 'Acesso Aprovisionadora'}
                  </h3>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${
                    loginType === 'admin' ? 'text-[#E5BA5D]' : 'text-emerald-400'
                  }`}>
                    {loginType === 'admin' ? 'Controle Completo e Gestão de Escalas' : 'Asp Of Strieder — Leitura, Assinatura e Impressão'}
                  </p>
                </div>

                {/* Credentials Form */}
                <form id="login-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">E-mail de Acesso</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        id="login-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060907]/60 border border-[#E5BA5D]/20 text-slate-200 focus:outline-hidden focus:border-[#E5BA5D] font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Senha de Segurança</label>
                      <a href="#" className="text-[10px] text-[#E5BA5D] hover:underline font-bold">Esqueceu?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        id="login-password-input"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060907]/60 border border-[#E5BA5D]/20 text-slate-200 focus:outline-hidden focus:border-[#E5BA5D] font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 px-4 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${
                      loginType === 'admin'
                        ? 'bg-gradient-to-b from-[#FFF2BF] to-[#E5BA5D] hover:from-[#FFFFFF] hover:to-[#FFF2BF] text-[#0c120d]'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                    }`}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5" />
                        <span>Entrar como {loginType === 'admin' ? 'Gestor' : 'Asp Of Strieder'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL FOR REAL MILITARY SCALES CHECKER (Drawer-like overlay) */}
      {showRealScales && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 text-slate-100">
            <button
              onClick={() => setShowRealScales(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase leading-none">
                  Escalas Existentes Reais
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Postos de serviço ativos no Setor de Aprovisionamento (Regimento)
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {realScales.map((f, i) => (
                <div key={f.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-md shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase">
                      {f.nome}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {f.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-wider font-semibold">
              Total de {realScales.length} escalas de serviço ativas no sistema.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
