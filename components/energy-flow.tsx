"use client";

import { useEffect, useRef } from "react";

/**
 * A yin-yang "energy flow" rendered on a 2D canvas: two particle streams
 * (flame orange and aqua teal) trace the interlocking teardrop halves of a
 * slowly rotating yin-yang, each half carrying a glowing "eye" of the
 * opposite color. The disc is tilted slightly in 3D and responds to pointer
 * movement; drifting silver motes fill the background.
 * prefers-reduced-motion renders a static frame.
 */

type StreamParticle = {
  t: number; // parameter along the teardrop loop (0..1)
  speed: number;
  offX: number; // fixed jitter giving the stream its thickness
  offY: number;
  offZ: number;
  size: number;
  stream: 0 | 1; // 0 = aqua, 1 = flame
};

type Mote = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
};

const AQUA = { r: 0, g: 199, b: 199 };
const FLAME = { r: 255, g: 122, b: 0 };

/**
 * Point on one teardrop half of a yin-yang, traversed at uniform speed.
 * The loop: right half of the outer circle (top to bottom), then the S-curve
 * back through the center — a bottom semicircle bulging left and a top
 * semicircle bulging right. The other stream uses the same path rotated 180°.
 */
function teardropPoint(t: number, R: number): { x: number; y: number } {
  if (t < 0.5) {
    const phi = Math.PI / 2 - (t / 0.5) * Math.PI; // π/2 → -π/2
    return { x: R * Math.cos(phi), y: R * Math.sin(phi) };
  }
  if (t < 0.75) {
    const u = (t - 0.5) / 0.25;
    const phi = -Math.PI / 2 - u * Math.PI; // bottom lobe, bulging left
    return {
      x: (R / 2) * Math.cos(phi),
      y: -R / 2 + (R / 2) * Math.sin(phi),
    };
  }
  const u = (t - 0.75) / 0.25;
  const phi = -Math.PI / 2 + u * Math.PI; // top lobe, bulging right
  return {
    x: (R / 2) * Math.cos(phi),
    y: R / 2 + (R / 2) * Math.sin(phi),
  };
}

export function EnergyFlow({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles: StreamParticle[] = [];
    const motes: Mote[] = [];
    const PARTICLES_PER_STREAM = 170;
    const MOTES = 28;

    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
        particles.push({
          t: Math.random(),
          speed: 0.0001 + Math.random() * 0.00012,
          offX: (Math.random() - 0.5) * 0.14,
          offY: (Math.random() - 0.5) * 0.14,
          offZ: (Math.random() - 0.5) * 0.2,
          size: 1 + Math.random() * 1.9,
          stream: s as 0 | 1,
        });
      }
    }
    for (let i = 0; i < MOTES; i++) {
      motes.push({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 2 - 1,
        vx: (Math.random() - 0.5) * 0.00005,
        vy: (Math.random() - 0.5) * 0.00004,
        size: 0.6 + Math.random() * 1.6,
      });
    }

    // Pointer-driven tilt with easing, on top of a gentle base tilt that
    // gives the yin-yang disc its 3D perspective.
    const BASE_TILT_X = 0.42;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = nx * 0.22;
      targetTiltX = ny * 0.18;
    };
    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const project = (
      px: number,
      py: number,
      pz: number,
      spin: number,
      R: number
    ) => {
      // In-plane rotation of the whole yin-yang.
      const cosS = Math.cos(spin);
      const sinS = Math.sin(spin);
      let x3 = px * cosS - py * sinS;
      let y3 = px * sinS + py * cosS;
      let z3 = pz * R;

      // Tilt around X (base perspective + pointer), then Y (pointer).
      const ax = BASE_TILT_X + tiltX;
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const y2 = y3 * cosX - z3 * sinX;
      const z2 = y3 * sinX + z3 * cosX;
      y3 = y2;
      z3 = z2;

      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);
      const x2 = x3 * cosY + z3 * sinY;
      const zz = -x3 * sinY + z3 * cosY;
      x3 = x2;
      z3 = zz;

      const focal = 640;
      const scale = focal / (focal + z3);
      return { x: x3 * scale, y: y3 * scale, scale, z: z3 };
    };

    const draw = (time: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      tiltX += (targetTiltX - tiltX) * 0.04;
      tiltY += (targetTiltY - tiltY) * 0.04;

      // Centered on the hero logo: horizontal middle, upper third.
      const cx = width / 2;
      const cy = height * 0.34;
      const R = Math.min(Math.min(width, height) * 0.34, 210);
      const spin = time * 0.00022;

      // Silver motes (background layer).
      for (const mote of motes) {
        mote.x = (mote.x + mote.vx * 16 + 1) % 1;
        mote.y = (mote.y + mote.vy * 16 + 1) % 1;
        const px = mote.x * width;
        const py = mote.y * height;
        const twinkle =
          0.18 + 0.14 * Math.sin(time * 0.001 + mote.x * 40 + mote.y * 30);
        ctx.beginPath();
        ctx.arc(px, py, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 160, 178, ${twinkle})`;
        ctx.fill();
      }

      // The two "eyes": a dot of the opposite color inside each teardrop.
      const eyes = [
        { x: 0, y: R / 2, color: FLAME }, // flame eye inside the aqua half
        { x: 0, y: -R / 2, color: AQUA }, // aqua eye inside the flame half
      ];
      for (const eye of eyes) {
        const pt = project(eye.x, eye.y, 0, spin, R);
        const ex = cx + pt.x;
        const ey = cy + pt.y;
        const eyeR = R * 0.085 * pt.scale;
        const pulse = 0.75 + 0.25 * Math.sin(time * 0.0016);

        const halo = ctx.createRadialGradient(ex, ey, 0, ex, ey, eyeR * 3.4);
        halo.addColorStop(
          0,
          `rgba(${eye.color.r}, ${eye.color.g}, ${eye.color.b}, ${0.5 * pulse})`
        );
        halo.addColorStop(
          1,
          `rgba(${eye.color.r}, ${eye.color.g}, ${eye.color.b}, 0)`
        );
        ctx.beginPath();
        ctx.arc(ex, ey, eyeR * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${eye.color.r}, ${eye.color.g}, ${eye.color.b}, ${0.85 * pulse})`;
        ctx.fill();
      }

      // Depth-sort stream particles so nearer ones draw on top.
      const projected: {
        x: number;
        y: number;
        scale: number;
        z: number;
        p: StreamParticle;
      }[] = [];

      for (const p of particles) {
        p.t = (p.t + p.speed * 16) % 1;

        const base = teardropPoint(p.t, R);
        // The flame stream is the same path rotated 180°.
        const sign = p.stream === 0 ? 1 : -1;
        const px = (base.x + p.offX * R) * sign;
        const py = (base.y + p.offY * R) * sign;

        const pt = project(px, py, p.offZ, spin, R);
        projected.push({
          x: cx + pt.x,
          y: cy + pt.y,
          scale: pt.scale,
          z: pt.z,
          p,
        });
      }

      projected.sort((a, b) => b.z - a.z);

      for (const point of projected) {
        const { p } = point;
        const color = p.stream === 0 ? AQUA : FLAME;
        // Brighter comet "head" sweeping around each loop.
        const headDist = (p.t - spin * 0.15 + 10) % 1;
        const head = 0.55 + 0.45 * Math.exp(-headDist * 5);
        const depthFade =
          0.45 + 0.55 * Math.min(1, Math.max(0, point.scale - 0.45));
        const alpha = 0.6 * head * depthFade;
        const size = p.size * point.scale;

        const glow = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          size * 3
        );
        glow.addColorStop(
          0,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
        );
        glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(1, alpha + 0.25)})`;
        ctx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
