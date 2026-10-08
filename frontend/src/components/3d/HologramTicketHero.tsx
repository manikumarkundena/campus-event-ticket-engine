'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Sparkles,
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  RefreshCw,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import * as THREE from 'three';

export function HologramTicketHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [webGLActive, setWebGLActive] = useState(true);

  // Three.js ambient background scene setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number;

    try {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 460;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      // Ambient particle nodes representing campus interconnectivity
      const count = 75;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const colorA = new THREE.Color(0x6366f1); // Indigo
      const colorB = new THREE.Color(0x10b981); // Emerald

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 8;
        positions[i + 1] = (Math.random() - 0.5) * 7;
        positions[i + 2] = (Math.random() - 0.5) * 4;

        const lerped = colorA.clone().lerp(colorB, Math.random());
        colors[i] = lerped.r;
        colors[i + 1] = lerped.g;
        colors[i + 2] = lerped.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const clock = new THREE.Clock();

      const renderLoop = () => {
        animationId = requestAnimationFrame(renderLoop);
        const elapsed = clock.getElapsedTime();
        points.rotation.y = elapsed * 0.04;
        points.rotation.x = elapsed * 0.02;
        renderer?.render(scene, camera);
      };

      renderLoop();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        geometry.dispose();
        material.dispose();
      };
    } catch {
      setWebGLActive(false);
    }
  }, []);

  // Parallax tilt on mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -8;
    const tiltY = (x / (rect.width / 2)) * 8;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      className="relative w-full max-w-[380px] sm:max-w-[420px] h-[520px] flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three.js Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Main 3D Card Object */}
      <div
        ref={cardRef}
        style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="relative z-10 w-full rounded-3xl glass-panel-elevated border border-slate-700/80 overflow-hidden shadow-pass"
      >
        {/* Holographic iridescent foil top banner */}
        <div className="h-2.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 via-emerald-400 to-amber-400 iridescent-foil" />

        {/* Card Header: EVENTRA & Institutional SIT Identity */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-glow-indigo">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-white">
                EVENTRA
              </p>
              <p className="text-[10px] text-slate-400">Siddaganga Institute of Technology</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VALID PASS
            </span>
          </div>
        </div>

        {/* Card Body: Dynamic Front or Back Face */}
        {!isFlipped ? (
          <div className="p-6 space-y-4">
            {/* Event Category & Title */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                FLAGSHIP HACKATHON
              </span>
              <h3 className="font-extrabold text-white text-lg leading-snug tracking-tight">
                SIT TECHHACK 2026: 36-Hour National Hackathon
              </h3>
            </div>

            {/* Event Logistics Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" /> Date
                </span>
                <p className="font-semibold text-slate-200">Oct 15–16, 2026</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Venue
                </span>
                <p className="font-semibold text-slate-200 truncate">CS/IS Computing Labs</p>
              </div>
            </div>

            {/* Perforated Divider Line with Cutout Notches */}
            <div className="relative py-1">
              <div className="border-t-2 border-dashed border-slate-800 w-full" />
              <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] border border-slate-700/60" />
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] border border-slate-700/60" />
            </div>

            {/* Attendee Strip & QR Code Target Reticle */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Attendee</span>
                <p className="font-bold text-white text-sm">Raghavendra Rao</p>
                <p className="text-[11px] font-mono text-slate-400">USN: 1SI22CS101</p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
                    TKT-SIT-TH01
                  </span>
                </div>
              </div>

              {/* QR Scanner Target */}
              <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-slate-700/50 flex items-center justify-center shrink-0">
                <QRCodeSVG
                  value="TKT_PASS_SIT_TECHHACK_STUDENT1_VALID_TOKEN"
                  size={92}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Back Face: Campus Admission Policy & Pass Verification */
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                CAMPUS ADMISSION POLICY
              </span>
              <h4 className="font-bold text-white text-base">Entry Guidelines</h4>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <p className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">1.</span> Single-entry digital pass. Duplicate presentation at the gate will be flagged.
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">2.</span> Carry physical college student ID card for identity verification at the entrance.
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">3.</span> Pass valid only for the scheduled event and specified campus venue.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[11px]">
              <p className="text-[10px] uppercase text-slate-400">Digital Pass Identifier</p>
              <p className="text-slate-300 truncate bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                PASS_TOKEN_VERIFIED_SIT_2026
              </p>
            </div>
          </div>
        )}

        {/* Card Footer: Interactive Flip Action & Gate Verification Link */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isFlipped ? 'Show Ticket Details' : 'View Admission Policy'}</span>
          </button>

          <Link
            href="/gate/validate"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Gate Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
