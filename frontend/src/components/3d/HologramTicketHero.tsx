'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Ticket, Sparkles, QrCode, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import * as THREE from 'three';

export function HologramTicketHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    let animationFrameId: number;

    // Scene setup
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for mouse interaction
    const group = new THREE.Group();
    scene.add(group);

    // 1. Digital Ticket Geometry (Chamfered Card)
    const cardGeometry = new THREE.BoxGeometry(2.4, 3.6, 0.08);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      metalness: 0.85,
      roughness: 0.15,
      transmission: 0.4,
      transparent: true,
      opacity: 0.95,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    group.add(cardMesh);

    // 2. Holographic Border Wireframe / Accent
    const wireGeometry = new THREE.EdgesGeometry(cardGeometry);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    group.add(wireframe);

    // 3. Ambient Particle Constellation (Campus event nodes)
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x6366f1);
    const colorB = new THREE.Color(0x10b981);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 6;

      const mix = Math.random();
      const c = colorA.clone().lerp(colorB, mix);
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 5, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 4, 20);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth lerp tilt
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;

      // Subtle float wave
      group.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Particle constellation rotation
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      cardGeometry.dispose();
      cardMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center">
      {/* 3D WebGL Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Overlay Digital Holographic Ticket Badge (Interlocking visual element) */}
      <div className="relative z-10 w-72 sm:w-80 rounded-2xl glass-panel p-6 shadow-ticket border border-indigo-500/30 backdrop-blur-2xl hologram-shimmer pointer-events-auto transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Verified SIT Digital Pass
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">#SIT-2026-LIVE</span>
        </div>

        <div className="my-5 space-y-2">
          <div className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
            FLAGSHIP HACKATHON
          </div>
          <h3 className="font-bold text-white text-lg leading-snug">
            SIT TECHHACK 2026: 36-Hour National Hackathon
          </h3>
          <p className="text-xs text-slate-400">
            CS/IS Advanced Computing Labs & Incubation Center
          </p>
        </div>

        {/* Dynamic Pass Perforation Line */}
        <div className="relative my-4">
          <div className="border-t border-dashed border-slate-700 w-full" />
          <div className="absolute -left-8 -top-3 w-6 h-6 rounded-full bg-slate-950" />
          <div className="absolute -right-8 -top-3 w-6 h-6 rounded-full bg-slate-950" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Attendee</p>
            <p className="text-xs font-semibold text-white">Raghavendra Rao</p>
            <p className="text-[10px] font-mono text-slate-400">1SI22CS101 • CSE</p>
          </div>
          <div className="p-2 rounded-xl bg-white text-slate-950 shadow-md">
            <QrCode className="w-9 h-9" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Fast Gate Clearance
          </span>
          <span className="font-mono text-indigo-400">TKT-SIT-TH01</span>
        </div>
      </div>
    </div>
  );
}
