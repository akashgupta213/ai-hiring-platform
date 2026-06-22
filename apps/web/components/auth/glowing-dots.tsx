"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface GlowingDotsHandle {
  setActive: (active: boolean) => void;
}

export const GlowingDots = forwardRef<GlowingDotsHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false); // off by default — only on when cursor is inside
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    setActive: (val: boolean) => {
      activeRef.current = val;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 24;
    const CURSOR_RADIUS = 100; // px — how close cursor must be to light a dot

    type Dot = { x: number; y: number; brightness: number };
    let dots: Dot[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dots = [];
      const cols = Math.ceil(canvas.width / SPACING) + 1;
      const rows = Math.ceil(canvas.height / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * SPACING, y: r * SPACING, brightness: 0 });
        }
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Track mouse inside this canvas only
    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    function handleMouseEnter() {
      activeRef.current = true;
    }
    function handleMouseLeave() {
      activeRef.current = false;
      mouseRef.current = null;
    }

    // Use the parent element so the full section area is tracked
    const parent = canvas.parentElement ?? canvas;
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    let raf: number;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const isActive = activeRef.current;

      for (const dot of dots) {
        // Target brightness: proximity to cursor when active, else 0
        let target = 0;
        if (isActive && mouse) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS) {
            // Smooth falloff — 1 at cursor, 0 at edge
            const t = 1 - dist / CURSOR_RADIUS;
            target = t * t * t; // cubic — stays bright in centre, drops fast at edge
          }
        }

        // Smooth lerp toward target — fast to light up, fast to fade out
        const speed = target > dot.brightness ? 0.18 : 0.12;
        dot.brightness += (target - dot.brightness) * speed;

        const b = dot.brightness;

        // Resting dim dot — always visible as a subtle grey
        const restAlpha = 0.12;
        const glowAlpha = restAlpha + b * (1 - restAlpha);

        // Dot radius: grows slightly when bright
        const radius = 1.2 + b * 1.2;

        // Pure white — no colour shift, no halo
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
});

GlowingDots.displayName = "GlowingDots";