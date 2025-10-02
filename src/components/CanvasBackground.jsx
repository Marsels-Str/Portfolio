import { useEffect, useRef } from "react";

export default function CanvasBackground({ particleCount = 60, color = "#38bdf8" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let width = 0, height = 0;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, fade: 0, down: false, targets: [] };
    const particles = [];

    const maxSpeed = 0.4;
    const sizeRange = [2, 4];
    const linkDist = 150;
    const mouseInfluence = 400;
    const mouseForce = 0.25;
    const friction = 0.98;

    const rand = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const x = rand(0, width), y = rand(0, height);
        particles.push({
          x, y,
          vx: rand(-maxSpeed, maxSpeed),
          vy: rand(-maxSpeed, maxSpeed),
          r: rand(sizeRange[0], sizeRange[1]),
          dragging: false,
          wanderPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    const handleMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.fade = 1; };
    const handleMouseDown = e => {
      mouse.down = true;
      mouse.targets = [];
      for (let p of particles) {
        if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < p.r * 10) {
          p.dragging = true;
          mouse.targets.push(p);
        }
      }
    };
    const handleMouseUp = () => { mouse.down = false; for (let p of mouse.targets) p.dragging = false; mouse.targets = []; };

    function hexToRgba(hex, alpha = 1) {
      let c = hex.replace("#", "");
      if (c.length === 3) c = c.split("").map(ch => ch + ch).join("");
      const num = parseInt(c, 16);
      return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
    }

    function step() {
      mouse.fade = Math.max(0, mouse.fade - 0.01);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      for (let p of particles) {
        if (p.dragging && mouse.down) {
          p.x = mouse.x; p.y = mouse.y; p.vx = 0; p.vy = 0;
        } else {
          p.wanderPhase += 0.01;
          p.vx += Math.cos(p.wanderPhase) * 0.01;
          p.vy += Math.sin(p.wanderPhase) * 0.01;

          if (mouse.fade > 0) {
            const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
            if (dist < mouseInfluence) {
              const f = (1 - dist / mouseInfluence) ** 2 * mouseForce * mouse.fade;
              p.vx += (dx / (dist || 1)) * f;
              p.vy += (dy / (dist || 1)) * f;
            }
          }

          p.vx *= friction; p.vy *= friction;
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, "rgba(255,255,255,0.95)");
        grad.addColorStop(0.3, hexToRgba(color, 0.8));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < linkDist) {
            ctx.strokeStyle = hexToRgba(color, (1 - dist / linkDist) * 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }

    resize(); initParticles();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [particleCount, color]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto", background: "transparent" }} />;
}
