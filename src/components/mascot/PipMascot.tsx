import React, { useState, useEffect, useRef } from 'react';

interface PipMascotProps {
  outfitId?: string;
  rotation?: number; // 0 to 360
  onRotationChange?: (angle: number) => void;
  interactiveRotation?: boolean;
  mood?: 'happy' | 'cheering' | 'thinking' | 'curious';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeech?: boolean;
  speechText?: string;
}

export const PipMascot: React.FC<PipMascotProps> = ({
  outfitId = 'outfit_default',
  rotation = 0,
  onRotationChange,
  interactiveRotation = true,
  mood = 'happy',
  size = 'lg',
  showSpeech = false,
  speechText,
}) => {
  const [internalAngle, setInternalAngle] = useState(rotation);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragStartAngle = useRef<number>(0);

  // Sync external rotation
  useEffect(() => {
    setInternalAngle(rotation);
  }, [rotation]);

  // Periodic natural blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const normalizedAngle = ((internalAngle % 360) + 360) % 360;
  // Is character facing backwards? (between 90 and 270)
  const isBackView = normalizedAngle > 90 && normalizedAngle < 270;

  // Mouse/Touch Drag for 360-degree rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactiveRotation) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = internalAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !interactiveRotation) return;
    const deltaX = e.clientX - dragStartX.current;
    // 1 pixel drag = 1.2 degrees rotation
    const newAngle = Math.round(dragStartAngle.current + deltaX * 1.2);
    setInternalAngle(newAngle);
    if (onRotationChange) {
      onRotationChange(((newAngle % 360) + 360) % 360);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactiveRotation) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Dimensions
  const sizeMap = {
    sm: { w: 90, h: 105, scale: 'scale-75' },
    md: { w: 140, h: 165, scale: 'scale-90' },
    lg: { w: 220, h: 260, scale: 'scale-100' },
    xl: { w: 280, h: 330, scale: 'scale-110' },
  };

  const { w, h } = sizeMap[size];

  // Visual tilt skew based on rotation for pseudo-3D parallax
  const xOffset = Math.sin((normalizedAngle * Math.PI) / 180) * 12;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Optional Speech Bubble */}
      {showSpeech && speechText && (
        <div className="absolute -top-12 z-20 bg-white/95 text-slate-800 text-xs font-medium py-1.5 px-3 rounded-xl shadow-md border border-slate-100 whitespace-nowrap animate-bounce flex items-center gap-1.5">
          <span className="text-amber-500">✨</span>
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45" />
        </div>
      )}

      {/* 3D Mascot Interactive Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: w,
          height: h,
          cursor: interactiveRotation ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        className="relative perspective-1000 flex items-center justify-center transition-transform"
      >
        {/* Soft Ground Shadow that follows angle */}
        <div
          className="absolute bottom-2 rounded-full bg-slate-400/20 blur-[3px] transition-all"
          style={{
            width: w * 0.65,
            height: 14,
            transform: `scale(${1 - Math.abs(xOffset) * 0.015})`,
          }}
        />

        {/* Mascot SVG Vector Rig */}
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full overflow-visible transition-transform duration-75"
          style={{
            transform: `rotateY(${internalAngle}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <defs>
            {/* Gradients for Pip's soft Chibi fur */}
            <linearGradient id="furGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>
            <linearGradient id="tummyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient id="beeStripe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="tweedPattern" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
          </defs>

          {/* BACK VIEW RENDER */}
          {isBackView ? (
            <g id="pip-back-view" transform="scale(-1, 1) translate(-200, 0)">
              {/* Ears from behind */}
              <path d="M 60 70 Q 40 20 65 30 Q 80 50 78 75 Z" fill="#F97316" />
              <path d="M 140 70 Q 160 20 135 30 Q 120 50 122 75 Z" fill="#F97316" />

              {/* Head from behind */}
              <ellipse cx="100" cy="85" rx="52" ry="46" fill="url(#furGradient)" />

              {/* Back of Headwear / Outfits */}
              {outfitId === 'outfit_professor' && (
                <g id="prof-cap-back">
                  <polygon points="100,20 150,34 100,48 50,34" fill="#1E293B" />
                  <path d="M 100 34 L 142 52" stroke="#F59E0B" strokeWidth="2.5" />
                  <circle cx="142" cy="54" r="3.5" fill="#F59E0B" />
                </g>
              )}

              {outfitId === 'outfit_sherlock' && (
                <g id="sherlock-hat-back">
                  <path d="M 60 65 Q 100 32 140 65 Q 100 55 60 65 Z" fill="#78350F" />
                  <path d="M 75 42 Q 100 28 125 42 Z" fill="#92400E" />
                </g>
              )}

              {outfitId === 'outfit_bunny' && (
                <g id="bunny-ears-back">
                  <ellipse cx="70" cy="30" rx="9" ry="28" fill="#FFFFFF" />
                  <ellipse cx="130" cy="30" rx="9" ry="28" fill="#FFFFFF" />
                </g>
              )}

              {outfitId === 'outfit_dino' && (
                <g id="dino-hood-back">
                  <path d="M 54 85 Q 100 38 146 85 Q 100 70 54 85 Z" fill="#10B981" />
                  {/* Dorsal spikes */}
                  <polygon points="100,40 100,22 108,35" fill="#047857" />
                  <polygon points="100,60 100,45 108,55" fill="#047857" />
                </g>
              )}

              {/* Torso from behind */}
              <ellipse cx="100" cy="155" rx="42" ry="46" fill="url(#furGradient)" />

              {/* Outfit Back Body */}
              {outfitId === 'outfit_default' && (
                <path d="M 62 135 Q 100 130 138 135 Q 142 185 100 190 Q 58 185 62 135 Z" fill="#38BDF8" opacity="0.9" />
              )}

              {outfitId === 'outfit_bee' && (
                <g id="bee-back">
                  <path d="M 62 135 Q 100 130 138 135 Q 142 188 100 192 Q 58 188 62 135 Z" fill="#FBBF24" />
                  {/* Stripes */}
                  <path d="M 64 148 Q 100 144 136 148" stroke="#1F2937" strokeWidth="10" />
                  <path d="M 66 170 Q 100 166 134 170" stroke="#1F2937" strokeWidth="10" />
                  {/* Translucent Wings fluttering on back */}
                  <ellipse cx="78" cy="120" rx="20" ry="10" fill="#BAE6FD" opacity="0.75" transform="rotate(-25 78 120)" />
                  <ellipse cx="122" cy="120" rx="20" ry="10" fill="#BAE6FD" opacity="0.75" transform="rotate(25 122 120)" />
                  {/* Bee Stinger */}
                  <polygon points="100,192 96,204 104,204" fill="#1F2937" />
                </g>
              )}

              {outfitId === 'outfit_dino' && (
                <g id="dino-back-spikes">
                  <path d="M 62 135 Q 100 130 138 135 Q 142 185 100 190 Q 58 185 62 135 Z" fill="#10B981" />
                  {/* Body dorsal spikes */}
                  <polygon points="100,140 100,126 107,136" fill="#047857" />
                  <polygon points="100,160 100,148 107,156" fill="#047857" />
                  <polygon points="100,180 100,168 107,176" fill="#047857" />
                  {/* Dino tail */}
                  <path d="M 100 188 Q 115 210 125 215 Q 112 218 100 198 Z" fill="#10B981" />
                </g>
              )}

              {outfitId === 'outfit_bunny' && (
                <g id="bunny-overalls-back">
                  <path d="M 65 145 Q 100 142 135 145 Q 138 190 100 190 Q 62 190 65 145 Z" fill="#2563EB" />
                  {/* Overalls cross straps */}
                  <line x1="75" y1="130" x2="125" y2="175" stroke="#1D4ED8" strokeWidth="6" />
                  <line x1="125" y1="130" x2="75" y2="175" stroke="#1D4ED8" strokeWidth="6" />
                  {/* Fluffy round bunny tail */}
                  <circle cx="100" cy="186" r="11" fill="#FFFFFF" />
                </g>
              )}

              {outfitId === 'outfit_professor' && (
                <g id="prof-blazer-back">
                  <path d="M 62 130 Q 100 128 138 130 Q 142 185 100 188 Q 58 185 62 130 Z" fill="#312E81" />
                  <line x1="100" y1="132" x2="100" y2="186" stroke="#1E1B4B" strokeWidth="2" strokeDasharray="3,3" />
                </g>
              )}

              {outfitId === 'outfit_sherlock' && (
                <g id="sherlock-trench-back">
                  <path d="M 60 125 Q 100 122 140 125 Q 145 192 100 195 Q 55 192 60 125 Z" fill="#78350F" />
                  {/* Trench back vent */}
                  <line x1="100" y1="165" x2="100" y2="195" stroke="#451A03" strokeWidth="3" />
                </g>
              )}

              {outfitId === 'outfit_astronaut' && (
                <g id="astro-back">
                  <rect x="75" y="140" width="50" height="36" rx="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
                  {/* Life support vents */}
                  <circle cx="88" cy="158" r="4" fill="#0EA5E9" />
                  <circle cx="112" cy="158" r="4" fill="#10B981" />
                </g>
              )}

              {/* Little cute feet */}
              <ellipse cx="80" cy="198" rx="14" ry="9" fill="#EA580C" />
              <ellipse cx="120" cy="198" rx="14" ry="9" fill="#EA580C" />
            </g>
          ) : (
            /* FRONT / THREE-QUARTER VIEW RENDER */
            <g id="pip-front-view">
              {/* Cute Chibi Ears */}
              <g id="ears">
                <path d="M 58 72 Q 35 22 64 30 Q 78 52 76 76 Z" fill="#F97316" />
                <path d="M 60 65 Q 46 32 64 38 Q 72 52 70 68 Z" fill="#FDE047" />

                <path d="M 142 72 Q 165 22 136 30 Q 122 52 124 76 Z" fill="#F97316" />
                <path d="M 140 65 Q 154 32 136 38 Q 128 52 130 68 Z" fill="#FDE047" />
              </g>

              {/* Headwear & Accessories Behind Head */}
              {outfitId === 'outfit_bunny' && (
                <g id="bunny-ears-front">
                  <ellipse cx="72" cy="24" rx="10" ry="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                  <ellipse cx="72" cy="24" rx="5" ry="24" fill="#FCE7F3" />
                  <ellipse cx="128" cy="24" rx="10" ry="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                  <ellipse cx="128" cy="24" rx="5" ry="24" fill="#FCE7F3" />
                </g>
              )}

              {outfitId === 'outfit_bee' && (
                <g id="bee-antennas">
                  {/* Translucent Wings */}
                  <ellipse cx="48" cy="120" rx="22" ry="11" fill="#BAE6FD" opacity="0.8" transform="rotate(-30 48 120)" />
                  <ellipse cx="152" cy="120" rx="22" ry="11" fill="#BAE6FD" opacity="0.8" transform="rotate(30 152 120)" />
                  {/* Antennas */}
                  <line x1="82" y1="52" x2="68" y2="24" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="68" cy="24" r="6" fill="#FBBF24" />
                  <line x1="118" y1="52" x2="132" y2="24" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="132" cy="24" r="6" fill="#FBBF24" />
                </g>
              )}

              {outfitId === 'outfit_dino' && (
                <g id="dino-hood-layer">
                  <path d="M 50 82 Q 100 24 150 82 Q 100 66 50 82 Z" fill="#10B981" />
                  <polygon points="100,24 95,6 105,6" fill="#047857" />
                </g>
              )}

              {/* Head Base */}
              <ellipse cx="100" cy="85" rx="52" ry="46" fill="url(#furGradient)" />

              {/* Cute Cheek White Fluff Patches */}
              <path d="M 52 90 Q 64 80 72 94 Q 60 102 52 90 Z" fill="#FFFBEB" />
              <path d="M 148 90 Q 136 80 128 94 Q 140 102 148 90 Z" fill="#FFFBEB" />

              {/* Headwear - Front Layer */}
              {outfitId === 'outfit_professor' && (
                <g id="prof-cap-front">
                  <polygon points="100,20 154,34 100,48 46,34" fill="#1E293B" />
                  <rect x="76" y="44" width="48" height="12" rx="4" fill="#0F172A" />
                  <path d="M 100 34 L 146 54" stroke="#F59E0B" strokeWidth="2.5" />
                  <circle cx="146" cy="56" r="3.5" fill="#F59E0B" />
                </g>
              )}

              {outfitId === 'outfit_sherlock' && (
                <g id="sherlock-cap-front">
                  <path d="M 55 64 Q 100 28 145 64 Q 100 52 55 64 Z" fill="#78350F" />
                  <path d="M 50 64 Q 100 54 150 64 Q 100 68 50 64 Z" fill="#92400E" />
                  <circle cx="100" cy="46" r="4" fill="#451A03" />
                </g>
              )}

              {outfitId === 'outfit_astronaut' && (
                <g id="astro-helmet">
                  <ellipse cx="100" cy="85" rx="58" ry="52" fill="none" stroke="#94A3B8" strokeWidth="4" />
                  <path d="M 68 52 Q 100 44 132 52" stroke="#38BDF8" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                </g>
              )}

              {/* Sweet Kawaii Blush */}
              <circle cx="70" cy="98" r="8" fill="#FB7185" opacity="0.45" />
              <circle cx="130" cy="98" r="8" fill="#FB7185" opacity="0.45" />

              {/* Expressive Chibi Eyes */}
              {isBlinking ? (
                <g id="eyes-blinking">
                  <path d="M 72 88 Q 80 92 88 88" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 112 88 Q 120 92 128 88" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : mood === 'cheering' ? (
                <g id="eyes-cheering">
                  {/* Happy upside-down curved eyes */}
                  <path d="M 72 90 Q 80 80 88 90" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 112 90 Q 120 80 128 90" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
                </g>
              ) : mood === 'thinking' ? (
                <g id="eyes-thinking">
                  {/* One wide eye, one squinted eye */}
                  <circle cx="80" cy="86" r="7.5" fill="#1F2937" />
                  <circle cx="78" cy="84" r="2.5" fill="#FFFFFF" />
                  <path d="M 114 86 Q 122 83 128 86" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                <g id="eyes-normal">
                  {/* Big round sparkly anime eyes */}
                  <circle cx="80" cy="86" r="7.5" fill="#1F2937" />
                  <circle cx="78" cy="83" r="2.8" fill="#FFFFFF" />
                  <circle cx="82" cy="88" r="1.2" fill="#FFFFFF" />

                  <circle cx="120" cy="86" r="7.5" fill="#1F2937" />
                  <circle cx="118" cy="83" r="2.8" fill="#FFFFFF" />
                  <circle cx="122" cy="88" r="1.2" fill="#FFFFFF" />
                </g>
              )}

              {/* Tiny Button Nose & Smile */}
              <ellipse cx="100" cy="95" rx="3.5" ry="2.5" fill="#C2410C" />
              {mood === 'cheering' ? (
                <path d="M 94 100 Q 100 110 106 100 Z" fill="#E11D48" />
              ) : (
                <path d="M 95 101 Q 100 106 105 101" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              )}

              {/* Eye Glasses for Professor */}
              {outfitId === 'outfit_professor' && (
                <g id="harry-potter-glasses">
                  <circle cx="78" cy="86" r="13" fill="none" stroke="#D97706" strokeWidth="2.5" />
                  <circle cx="122" cy="86" r="13" fill="none" stroke="#D97706" strokeWidth="2.5" />
                  <line x1="91" y1="86" x2="109" y2="86" stroke="#D97706" strokeWidth="2.5" />
                </g>
              )}

              {/* Body Torso */}
              <ellipse cx="100" cy="155" rx="42" ry="46" fill="url(#furGradient)" />

              {/* Cream tummy */}
              <ellipse cx="100" cy="156" rx="26" ry="32" fill="url(#tummyGradient)" />

              {/* OUTFIT CLOTHING FRONT LAYERS */}
              {outfitId === 'outfit_default' && (
                <g id="outfit-default">
                  <path d="M 64 135 Q 100 130 136 135 Q 140 185 100 188 Q 60 185 64 135 Z" fill="#38BDF8" opacity="0.9" />
                  <path d="M 85 133 Q 100 142 115 133" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
                </g>
              )}

              {outfitId === 'outfit_bee' && (
                <g id="outfit-bee-front">
                  <path d="M 64 134 Q 100 128 136 134 Q 140 188 100 190 Q 60 188 64 134 Z" fill="#FBBF24" />
                  <path d="M 66 148 Q 100 144 134 148" stroke="#1F2937" strokeWidth="10" />
                  <path d="M 68 168 Q 100 164 132 168" stroke="#1F2937" strokeWidth="10" />
                  <ellipse cx="100" cy="158" rx="14" ry="16" fill="#FEF3C7" opacity="0.8" />
                </g>
              )}

              {outfitId === 'outfit_dino' && (
                <g id="outfit-dino-front">
                  <path d="M 64 134 Q 100 130 136 134 Q 140 186 100 188 Q 60 186 64 134 Z" fill="#10B981" />
                  {/* Soft tummy patch */}
                  <ellipse cx="100" cy="160" rx="18" ry="20" fill="#6EE7B7" />
                  {/* Cute pocket */}
                  <path d="M 90 165 Q 100 172 110 165 Z" fill="#047857" />
                </g>
              )}

              {outfitId === 'outfit_bunny' && (
                <g id="outfit-bunny-front">
                  <path d="M 66 142 Q 100 138 134 142 Q 138 188 100 190 Q 62 188 66 142 Z" fill="#2563EB" />
                  {/* Overalls Straps & Bronze Buttons */}
                  <line x1="78" y1="130" x2="78" y2="155" stroke="#1D4ED8" strokeWidth="6" />
                  <circle cx="78" cy="155" r="3" fill="#F59E0B" />
                  <line x1="122" y1="130" x2="122" y2="155" stroke="#1D4ED8" strokeWidth="6" />
                  <circle cx="122" cy="155" r="3" fill="#F59E0B" />
                  {/* Embroidered Carrot Pocket */}
                  <polygon points="100,162 95,174 105,174" fill="#F97316" />
                  <line x1="100" y1="162" x2="98" y2="158" stroke="#16A34A" strokeWidth="2" />
                  <line x1="100" y1="162" x2="102" y2="158" stroke="#16A34A" strokeWidth="2" />
                </g>
              )}

              {outfitId === 'outfit_professor' && (
                <g id="outfit-prof-front">
                  {/* Tweed blazer */}
                  <path d="M 62 130 Q 100 126 138 130 Q 142 186 100 188 Q 58 186 62 130 Z" fill="#312E81" />
                  {/* White collared shirt & gold bow tie */}
                  <polygon points="100,132 90,146 110,146" fill="#FFFFFF" />
                  <polygon points="92,144 100,148 92,152" fill="#F59E0B" />
                  <polygon points="108,144 100,148 108,152" fill="#F59E0B" />
                  <circle cx="100" cy="148" r="2.5" fill="#D97706" />
                </g>
              )}

              {outfitId === 'outfit_sherlock' && (
                <g id="outfit-sherlock-front">
                  <path d="M 60 126 Q 100 122 140 126 Q 144 192 100 194 Q 56 192 60 126 Z" fill="#78350F" />
                  {/* Double breasted buttons */}
                  <circle cx="92" cy="150" r="3" fill="#D97706" />
                  <circle cx="108" cy="150" r="3" fill="#D97706" />
                  <circle cx="92" cy="165" r="3" fill="#D97706" />
                  <circle cx="108" cy="165" r="3" fill="#D97706" />
                  {/* Belt */}
                  <rect x="74" y="172" width="52" height="6" fill="#451A03" />
                </g>
              )}

              {outfitId === 'outfit_astronaut' && (
                <g id="outfit-astro-front">
                  <path d="M 62 132 Q 100 128 138 132 Q 142 188 100 190 Q 58 188 62 132 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
                  {/* Starlight chest badge */}
                  <circle cx="100" cy="155" r="9" fill="#0EA5E9" />
                  <polygon points="100,148 102,153 107,155 102,157 100,162 98,157 93,155 98,153" fill="#FACC15" />
                </g>
              )}

              {/* Hand Holding Magnifying Glass for Sherlock */}
              {outfitId === 'outfit_sherlock' && (
                <g id="hand-magnifier">
                  <line x1="140" y1="160" x2="162" y2="140" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="166" cy="136" r="14" fill="#E0F2FE" stroke="#D97706" strokeWidth="3" opacity="0.85" />
                  <path d="M 160 130 Q 166 128 172 134" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* Cute Paws */}
              {outfitId !== 'outfit_sherlock' && (
                <g id="paws">
                  {mood === 'cheering' ? (
                    <>
                      <circle cx="56" cy="120" r="10" fill="#FED7AA" />
                      <circle cx="144" cy="120" r="10" fill="#FED7AA" />
                    </>
                  ) : (
                    <>
                      <circle cx="62" cy="154" r="9" fill="#FED7AA" />
                      <circle cx="138" cy="154" r="9" fill="#FED7AA" />
                    </>
                  )}
                </g>
              )}

              {/* Little cute feet */}
              <ellipse cx="80" cy="198" rx="14" ry="9" fill="#EA580C" />
              <ellipse cx="120" cy="198" rx="14" ry="9" fill="#EA580C" />
            </g>
          )}
        </svg>
      </div>

      {/* Rotation Degree Indicator & Quick Drag Hint */}
      {interactiveRotation && (
        <div className="mt-2 text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Drag or slide to rotate 360° ({normalizedAngle}°)</span>
        </div>
      )}
    </div>
  );
};
