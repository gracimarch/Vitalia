'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LiquidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Colors matching Vitalia brand + Soft Cream
    const colorPrimary = new THREE.Color(0x7134A2); // Purple
    const colorSecondary = new THREE.Color(0x00E5FF); // Cyan/Teal
    const colorTertiary = new THREE.Color(0xE1947F); // Soft Orange
    const colorQuaternary = new THREE.Color(0xFFF9E6); // Soft Cream

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    const updateSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    container.appendChild(renderer.domElement);
    updateSize();

    const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);
    meshGroup.scale.set(1.5, 1.5, 1.5);

    const vertexShader = `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;

      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                      i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
          vUv = uv;
          vec3 pos = position;
          float noiseFreq = 0.5;
          float noiseAmp = 0.18;
          float slowTime = uTime * 0.2;
          
          vec3 noisePos = vec3(pos.x * noiseFreq + slowTime, pos.y * noiseFreq + slowTime * 1.5, slowTime);
          float elevation = snoise(noisePos) * noiseAmp;
          vElevation = elevation;
          pos.z += elevation; 

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      
      varying float vElevation;
      varying vec2 vUv;

      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
          float mixStrength = (vElevation + 0.18) * 2.7; 
          vec3 color;
          
          if (mixStrength < 0.25) {
              color = uColor1;
          } else if (mixStrength < 0.45) {
              float t = smoothstep(0.25, 0.45, mixStrength);
              color = mix(uColor1, uColor2, t);
          } else if (mixStrength < 0.65) {
              float t = smoothstep(0.45, 0.65, mixStrength);
              color = mix(uColor2, uColor3, t);
          } else {
              float t = smoothstep(0.65, 0.85, mixStrength);
              t = min(t, 1.0);
              color = mix(uColor3, uColor4, t);
          }
          
          float noise = random(vUv * 99.0);
          color += (noise - 0.5) * 0.15; 
          
          gl_FragColor = vec4(color, 0.6);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: colorPrimary },
        uColor2: { value: colorSecondary },
        uColor3: { value: colorTertiary },
        uColor4: { value: colorQuaternary },
      },
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshGroup.add(mesh);

    // Use Date.now() instead of deprecated THREE.Clock
    const startTime = Date.now();
    let animationFrameId: number;

    const tick = () => {
      const elapsedTime = (Date.now() - startTime) / 1000 * 0.15;
      material.uniforms.uTime.value = elapsedTime;
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(tick);
    };

    tick();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} id="liquid-container" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />;
}
