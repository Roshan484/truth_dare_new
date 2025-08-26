"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
}

export function Particles({
  className,
  quantity = 50,
  staticity = 50,
  ease = 50,
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<Array<Particle>>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const { w, h } = { w: rect.width, h: rect.height };
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x < w && x > 0 && y < h && y > 0;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      const { width, height } =
        canvasContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      initParticles();
    }
  }, []);

  const initParticles = useCallback(() => {
    if (!canvasRef.current) return;

    particles.current = [];

    const { width, height } = canvasRef.current;

    for (let i = 0; i < quantity; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const vx = Math.random() - 0.5;
      const vy = Math.random() - 0.5;

      particles.current.push({
        x,
        y,
        vx,
        vy,
        color: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`,
        size: Math.random() * 2 + 0.5,
      });
    }
  }, [quantity]);

  const drawParticles = useCallback(() => {
    if (!context.current || !canvasRef.current) return;

    context.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    particles.current.forEach((particle) => {
      if (!context.current || !canvasRef.current) return;

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvasRef.current.width) {
        particle.vx = -particle.vx;
      }

      if (particle.y < 0 || particle.y > canvasRef.current.height) {
        particle.vy = -particle.vy;
      }

      // Mouse interaction
      const dx = mouse.current.x - particle.x;
      const dy = mouse.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        particle.vx -= (dx * force) / staticity;
        particle.vy -= (dy * force) / staticity;
      }

      context.current.beginPath();
      context.current.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );
      context.current.fillStyle = particle.color;
      context.current.fill();
    });
  }, [staticity]);

  const animate = useCallback(() => {
    drawParticles();
    requestAnimationFrame(animate);
  }, [drawParticles]);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [animate, onMouseMove, resizeCanvas]);

  useEffect(() => {
    initParticles();
  }, [initParticles, refresh, dimensions]);

  return (
    <div
      ref={canvasContainerRef}
      className={cn("fixed inset-0 -z-10", className)}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}
