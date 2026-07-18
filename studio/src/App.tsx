import React, { useState, useEffect, useRef } from 'react';

// Import custom PNG images from the root images directory
import youtubeIcon from '../images/youtube.png';
import telegramIcon from '../images/telegram.png';
import discordIcon from '../images/discord.png';
import xIcon from '../images/x.png';
import background1 from '../images/background1.jpg';
import background1star4 from '../images/background1star4.jpg';
import background1star5 from '../images/background1star5.jpg';

interface PixelIconProps {
  className?: string;
}

// ============================================================================
// РЕДАКТИРУЙТЕ ЭТИ СТРОКИ ДЛЯ ИЗМЕНЕНИЯ ТЕКСТА БЕГУЩИХ СТРОК (ПРАВАЯ ПОЛОВИНА):
const TICKER_LINES = [
  "sample text",
  "now loading...",
  "attention!!!",
  "Hi! My name is Liksa!",
  "I'm making a furry game about delivering packages.",
  "I'm not actually sure what else to write here.",
  "I hope you'll enjoy my work.",
  "You can support me by following my socials.",
  "MY SOCIALS",
  "disconnecting...",
  "connection lost",
  "retrying...",
  "no response",
];

const HalftoneDots: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        width = w;
        height = h;
      }
    });

    resizeObserver.observe(canvas);

    let startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const dotSpacing = 10;
      const cols = Math.ceil(width / dotSpacing) + 4;
      const rows = Math.ceil(height / dotSpacing) + 4;

      ctx.fillStyle = '#e6e6e6';

      for (let r = -2; r < rows; r++) {
        for (let c = -2; c < cols; c++) {
          const x = c * dotSpacing + 5;
          const y = r * dotSpacing + 5;

          // Diagonal progress calculation (under an angle)
          // 0.8 * y + 0.6 * (width - x) puts the gradient base (largest dots) on the left / bottom-left
          const diagonalPos = 0.8 * y + 0.6 * (width - x);
          
          // Let's dynamically map the values relative to the maximum diagonal extent
          const maxExtent = 0.8 * height + 0.6 * width;
          let progress = diagonalPos / maxExtent;
          progress = Math.max(0, Math.min(1, progress));

          // Vertical fade-out: smoothly shrink to 0 as y gets closer to 0 (top edge of the container)
          // This ensures the halftone pattern vanishes smoothly and doesn't abruptly cut off.
          const verticalFade = Math.pow(Math.max(0, Math.min(1, y / 120)), 1.5);

          // Base radius: smaller dots with high density, from 0.3px at the top-right to 3.5px at the bottom-left
          const baseRadius = 0.3 + 3.2 * progress;

          // Animation factor: 1 at progress=0 (small dots), 0 at progress=1 (base dots)
          // Using cubic easing-out to make it almost untouched near the base on the left
          const animFactor = Math.pow(1 - progress, 3);
          const amp = 0.9 * animFactor;

          // Smooth moving wave noise with much larger scale (lower spatial frequencies)
          // to make it feel like organic moving clouds/noise rather than distinct thin stripes
          const noise = Math.sin(elapsed * 0.0018 + x * 0.008 + y * 0.006);
          
          const radius = (baseRadius + amp * noise) * verticalFade;

          if (radius < 0.25) continue;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-10"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

const drawStar4 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
};

const drawStar5 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  const spikes = 5;
  const outerRadius = r;
  const innerRadius = r * 0.4;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
};

const drawVectorBox = (ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bh = h * 0.45;
  const bw = w * 0.55;
  
  const dx = bw * 0.5;
  const dy = bh * 0.3;

  // Box front-right panel
  ctx.fillStyle = '#f3f4f6';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + dx, cy - dy);
  ctx.lineTo(cx + dx, cy + bh - dy);
  ctx.lineTo(cx, cy + bh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Box front-left panel
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - dx, cy - dy);
  ctx.lineTo(cx - dx, cy + bh - dy);
  ctx.lineTo(cx, cy + bh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top interior (dark inside)
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + dx, cy - dy);
  ctx.lineTo(cx, cy - dy * 2);
  ctx.lineTo(cx - dx, cy - dy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left flap
  ctx.fillStyle = '#f3f4f6';
  ctx.beginPath();
  ctx.moveTo(cx - dx, cy - dy);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx - dx * 0.7, cy + dy * 0.5);
  ctx.lineTo(cx - dx * 1.5, cy - dy * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right flap
  ctx.fillStyle = '#f3f4f6';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + dx, cy - dy);
  ctx.lineTo(cx + dx * 1.5, cy - dy * 0.5);
  ctx.lineTo(cx + dx * 0.7, cy + dy * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Back flap
  ctx.fillStyle = '#d1d5db';
  ctx.beginPath();
  ctx.moveTo(cx - dx, cy - dy);
  ctx.lineTo(cx, cy - dy * 2);
  ctx.lineTo(cx - dx * 0.6, cy - dy * 2.8);
  ctx.lineTo(cx - dx * 1.4, cy - dy * 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Back-right flap
  ctx.fillStyle = '#d1d5db';
  ctx.beginPath();
  ctx.moveTo(cx, cy - dy * 2);
  ctx.lineTo(cx + dx, cy - dy);
  ctx.lineTo(cx + dx * 1.4, cy - dy * 1.8);
  ctx.lineTo(cx + dx * 0.6, cy - dy * 2.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx + dx * 0.3, cy + bh * 0.2);
  ctx.lineTo(cx + dx * 0.7, cy + bh * 0.2 - dy * 0.4);
  ctx.lineTo(cx + dx * 0.7, cy + bh * 0.5 - dy * 0.4);
  ctx.lineTo(cx + dx * 0.3, cy + bh * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Barcode lines
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + dx * 0.4, cy + bh * 0.25);
  ctx.lineTo(cx + dx * 0.4, cy + bh * 0.45);
  ctx.moveTo(cx + dx * 0.48, cy + bh * 0.23);
  ctx.lineTo(cx + dx * 0.48, cy + bh * 0.43);
  ctx.moveTo(cx + dx * 0.55, cy + bh * 0.21);
  ctx.lineTo(cx + dx * 0.55, cy + bh * 0.41);
  ctx.stroke();

  ctx.restore();
};

const BackgroundWithParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const bgImg = new Image();
    bgImg.src = background1;
    let bgLoaded = false;
    bgImg.onload = () => {
      if (bgImg.naturalWidth > 0) bgLoaded = true;
    };

    const star4Img = new Image();
    star4Img.src = background1star4;
    let star4Loaded = false;
    star4Img.onload = () => {
      if (star4Img.naturalWidth > 0) star4Loaded = true;
    };

    const star5Img = new Image();
    star5Img.src = background1star5;
    let star5Loaded = false;
    star5Img.onload = () => {
      if (star5Img.naturalWidth > 0) star5Loaded = true;
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        width = w;
        height = h;
      }
    });

    resizeObserver.observe(canvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      angle: number;
      spinSpeed: number;
      life: number;
      age: number;
      type: 'star4' | 'star5';
      color: string;
      seed: number;
    }

    let particles: Particle[] = [];
    let startTime = performance.now();
    let nextSpawnTime = 800; // spawn first set soon

    const draw = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // Slow organic scaling of background
      const scaleX = 1.0 + Math.sin(elapsed * 0.0012) * 0.035;
      const scaleY = 1.0 + Math.cos(elapsed * 0.0015) * 0.035;
      const offsetX = Math.sin(elapsed * 0.0008) * 5;
      const offsetY = Math.cos(elapsed * 0.001) * 5;

      // Position bottom-left and make it larger
      const boxX = width * 0.22 + offsetX;
      const boxY = height * 0.78 + offsetY;
      const boxSize = Math.max(280, Math.min(width * 0.75, height * 0.58, 450));

      // Draw background cardboard package
      ctx.save();
      ctx.translate(boxX, boxY);
      ctx.scale(scaleX, scaleY);

      if (bgLoaded) {
        ctx.globalAlpha = 0.25;
        ctx.drawImage(bgImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
      } else {
        ctx.globalAlpha = 0.2;
        drawVectorBox(ctx, 0, 0, boxSize, boxSize);
      }
      ctx.restore();

      // Particle Emitter at 3/4 height of the background package (interior opening of cardboard box)
      const emitterX = boxX;
      const emitterY = boxY + (boxSize * 0.25) * scaleY;

      // Spawn 2-3 particles at once, every 2-3 seconds
      if (elapsed >= nextSpawnTime) {
        const spawnCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 particles
        const colors = ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'];

        for (let i = 0; i < spawnCount; i++) {
          const speed = 12 + Math.random() * 8; // fast initial speed
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.45; // mostly upwards

          particles.push({
            x: emitterX + (Math.random() - 0.5) * 15,
            y: emitterY + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 24 + Math.random() * 22, // larger size
            opacity: 1.0,
            angle: angle,
            spinSpeed: (Math.random() - 0.5) * 0.15,
            life: 140 + Math.random() * 60, // lifespan
            age: 0,
            type: Math.random() < 0.5 ? 'star4' : 'star5',
            color: colors[Math.floor(Math.random() * colors.length)],
            seed: Math.random() * 100,
          });
        }
        // Next spawn in 2 to 3 seconds (2000 - 3000ms)
        nextSpawnTime = elapsed + 2000 + Math.random() * 1000;
      }

      // Particle updates
      particles = particles.filter((p) => {
        p.age += 1;
        if (p.age >= p.life) return false;

        const t = p.age / p.life;

        // Decelerate rapidly from the initial explosion velocity
        p.vx *= 0.85;
        p.vy *= 0.85;

        // Swerve/curve logic:
        if (t > 0.4) {
          // Accelerate to the left as they get closer to the end of their path
          const leftForce = -0.6 * (t - 0.4) * 5;
          p.vx += leftForce;

          // Turn or swerve randomly up or down (заворачивая в сторону)
          const curveDir = p.seed > 50 ? -1 : 1;
          const curveForceY = curveDir * 1.5 * Math.pow(t - 0.4, 2);
          p.vy += curveForceY;
        } else {
          // Gentle vertical rise initially
          p.vy += -0.15;
        }

        // Apply curling angle drift
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        let curAngle = Math.atan2(p.vy, p.vx);
        
        // Spin the angle heavily near the end to make them curl in spirals
        if (t > 0.45) {
          const spinFactor = Math.pow(t - 0.45, 1.5) * 6;
          curAngle += p.spinSpeed * spinFactor;
        } else {
          curAngle += p.spinSpeed * 0.1;
        }

        p.vx = Math.cos(curAngle) * speed;
        p.vy = Math.sin(curAngle) * speed;

        p.x += p.vx;
        p.y += p.vy;

        // Shrink & fade
        p.size = Math.max(0.1, (1 - t) * p.size);
        p.opacity = 1 - t;

        // Render particle
        ctx.save();
        ctx.globalAlpha = p.opacity * 0.65;
        ctx.fillStyle = p.color;

        if (p.type === 'star4') {
          if (star4Loaded) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.translate(p.x, p.y);
            ctx.rotate(p.age * 0.04);
            ctx.drawImage(star4Img, -p.size/2, -p.size/2, p.size, p.size);
          } else {
            drawStar4(ctx, p.x, p.y, p.size);
          }
        } else {
          if (star5Loaded) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.translate(p.x, p.y);
            ctx.rotate(p.age * 0.04);
            ctx.drawImage(star5Img, -p.size/2, -p.size/2, p.size, p.size);
          } else {
            drawStar5(ctx, p.x, p.y, p.size);
          }
        }
        ctx.restore();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default function App() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [smoothMouse, setSmoothMouse] = useState({ x: 0.5, y: 0.5 });
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });

  // Track global mouse coordinates anywhere on the window
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const isMobile = window.innerWidth < 768; // matching Tailwind's md: breakpoint
      if (isMobile) {
        // On mobile, the right pane is full-width (stacked at the bottom), so x maps 0 to 1
        mouseTarget.current.x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      } else {
        // On desktop, the right pane is the right 50%
        // So clientX from window.innerWidth/2 to window.innerWidth is mapped to 0 to 1
        const halfWidth = window.innerWidth / 2;
        const relativeX = (e.clientX - halfWidth) / halfWidth;
        mouseTarget.current.x = Math.max(0, Math.min(1, relativeX));
      }
      mouseTarget.current.y = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    let animationFrameId: number;
    let currentX = 0.5;
    let currentY = 0.5;

    // Smooth physics-based interpolation (lerping)
    const updateSmoothMouse = () => {
      currentX += (mouseTarget.current.x - currentX) * 0.08;
      currentY += (mouseTarget.current.y - currentY) * 0.08;
      setSmoothMouse({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updateSmoothMouse);
    };

    animationFrameId = requestAnimationFrame(updateSmoothMouse);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleRightPaneMouseLeave = () => {
    setHoveredIdx(null);
  };

  const isAnyRowHovered = hoveredIdx !== null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-black text-white overflow-hidden select-none font-mono">
      
      {/* ЛЕВАЯ ПОЛОВИНА СТРАНИЦЫ: БЕЛЫЙ ФОН */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 border-b-4 md:border-b-0 md:border-r-4 border-black relative z-20">
        {/* Background box with slow oscillation and swirling star particles */}
        <BackgroundWithParticles />

        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg flex flex-col items-stretch gap-1 select-none uppercase text-black font-pixel font-bold relative z-10">
          <div className="w-full flex justify-between text-[21vw] md:text-[10vw] leading-[0.85] tracking-normal text-black">
            {"SITE".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
          <div className="w-full flex justify-between text-[12.5vw] md:text-[6vw] leading-[0.85] tracking-normal text-black">
            {"UNDER".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
          <div className="w-full flex justify-between text-[5.4vw] md:text-[2.6vw] leading-[0.85] tracking-normal text-black mt-1">
            {"CONSTRUCTION".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
        </div>

        {/* Comic/Manga Halftone Dots Gradient */}
        <HalftoneDots />
      </div>

      {/* ПРАВАЯ ПОЛОВИНА СТРАНИЦЫ: ЧЕРНЫЙ ФОН С БЕГУЩИМИ СТРОКАМИ */}
      <div 
        onMouseLeave={handleRightPaneMouseLeave}
        className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen bg-black relative flex items-center justify-center overflow-hidden z-10 scanlines crt-flicker"
      >
        
        {/* Сетка на заднем плане для ретро атмосферы */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />
        
        {/* Темная бегущая полоса (эффект затвора/съемки CRT камеры) */}
        <div className="crt-roll-beam" />

        {/* Наклонный контейнер, плавно выпрямляющийся, когда наведена мышь на любую строку */}
        <div 
          className="absolute w-full h-[150%] flex flex-col justify-center gap-2 sm:gap-3 md:gap-4 transition-transform duration-500 ease-out"
          style={{ 
            transformOrigin: 'center center',
            transform: isAnyRowHovered 
              ? `rotate(0deg) translateY(${(smoothMouse.y - 0.5) * 80}px) scale(1.0)`
              : `rotate(-12deg) translateY(${(smoothMouse.y - 0.5) * 80}px) scale(1.3)`
          }}
        >
          {TICKER_LINES.map((text, idx) => (
            <TickerRow
              key={idx}
              text={text}
              idx={idx}
              hoveredIdx={hoveredIdx}
              setHoveredIdx={setHoveredIdx}
              globalMouseX={smoothMouse.x}
              isSocials={idx === 8}
            />
          ))}
        </div>
      </div>
      {/* Recolor SVG filter to dynamically turn black/colored PNG pixels into Phosphor Green (#00ff66) */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="recolor-green">
            <feFlood floodColor="#00ff66" result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

interface TickerRowProps {
  text: string;
  idx: number;
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
  globalMouseX: number;
  isSocials?: boolean;
}

const TickerRow: React.FC<TickerRowProps> = ({ text, idx, hoveredIdx, setHoveredIdx, globalMouseX, isSocials }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const singleTextRef = useRef<HTMLSpanElement>(null);
  
  const offsetRef = useRef<number>(0);
  const textWidthRef = useRef<number>(0);
  const initialOffsetSet = useRef<boolean>(false);
  
  const isHovered = hoveredIdx === idx;

  // Measure container and text bounds
  useEffect(() => {
    const measure = () => {
      if (singleTextRef.current) {
        const singleTextW = singleTextRef.current.offsetWidth;
        textWidthRef.current = singleTextW;
        
        // Randomize initial position offset slightly on first load so lines look varied
        if (!initialOffsetSet.current && singleTextW > 0) {
          offsetRef.current = -Math.random() * singleTextW;
          initialOffsetSet.current = true;
        }
      }
    };

    measure();
    window.addEventListener('resize', measure);
    
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 500);
    const t3 = setTimeout(measure, 1500);

    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [text]);

  // Butter-smooth physics and movement animation loop
  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.5 + (idx % 3) * 0.3; // constant leftward speed

    const tick = () => {
      if (!textRef.current || textWidthRef.current === 0) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const singleTextW = textWidthRef.current;
      const padding = 60; // Comfortable visual padding from screen edges

      if (isHovered) {
        // Drag mode: Map the mouse X (0 to 1) dynamically across exactly one full repetition.
        // Since the text wraps seamlessly, pulling left (0.0) or right (1.0) rotates the text perfectly.
        // Inverting the direction as requested (swapping left/right mapping).
        const targetOffset = padding - globalMouseX * singleTextW;
        
        // High-performance smooth physics tracking (lerping)
        offsetRef.current += (targetOffset - offsetRef.current) * 0.12;
      } else {
        // Automatic mode: Continue leftward motion smoothly from last position
        offsetRef.current -= speed;
        
        // Seamless infinite wrapping!
        if (offsetRef.current <= -singleTextW) {
          offsetRef.current += singleTextW;
        }
      }

      // Perform ultra-fast direct DOM manipulation
      textRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, globalMouseX, idx]);

  const opacities = ["opacity-100", "opacity-90", "opacity-80", "opacity-75", "opacity-65", "opacity-55"];
  const baseOpacity = opacities[idx % opacities.length];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHoveredIdx(idx)}
      className={`w-full overflow-hidden py-1 border-y border-neutral-900/30 transition-all duration-300 ease-out cursor-default select-none ${
        isHovered ? 'bg-neutral-950/70 scale-[1.03] z-30 shadow-[0_0_15px_rgba(0,255,102,0.15)]' : 'bg-transparent z-10'
      }`}
    >
      <div
        ref={textRef}
        className={`crt-green-text font-pixel font-bold uppercase tracking-wider text-[20px] sm:text-[26px] md:text-[30px] lg:text-[34px] whitespace-nowrap transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : baseOpacity
        }`}
        style={{
          display: 'inline-block',
          willChange: 'transform',
        }}
      >
        {/* We render 8 copies of the text dynamically to seamlessly and infinitely fill any screen width */}
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            ref={i === 0 ? singleTextRef : undefined}
            className="pr-12 inline-block"
          >
            {isSocials ? (
              <span className="inline-flex items-center gap-4">
                <span className="align-middle">MY SOCIALS</span>
                <span className="inline-flex items-center gap-3 sm:gap-4 md:gap-5 px-3 py-1 bg-neutral-900/50 rounded-md border border-neutral-800 pointer-events-auto cursor-default">
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-auto cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="YouTube"
                  >
                    <img
                      src={youtubeIcon}
                      alt="YouTube"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 inline-block align-middle crt-recolored-icon"
                    />
                  </a>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-auto cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Telegram"
                  >
                    <img
                      src={telegramIcon}
                      alt="Telegram"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 inline-block align-middle crt-recolored-icon"
                    />
                  </a>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-auto cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Discord"
                  >
                    <img
                      src={discordIcon}
                      alt="Discord"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 inline-block align-middle crt-recolored-icon"
                    />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-auto cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Twitter"
                  >
                    <img
                      src={xIcon}
                      alt="Twitter"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 inline-block align-middle crt-recolored-icon"
                    />
                  </a>
                </span>
              </span>
            ) : (
              text
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
