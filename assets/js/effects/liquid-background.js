document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('liquid-container');
    if (!container) {
        console.warn('Liquid container not found');
        return;
    }

    // Colors matching Vitalia brand + Soft Cream (Warm White)
    const colorPrimary = new THREE.Color(0x7134A2); // Purple
    const colorSecondary = new THREE.Color(0x00E5FF); // Cyan/Teal
    const colorTertiary = new THREE.Color(0xE1947F); // Soft Orange
    const colorQuaternary = new THREE.Color(0xFFF9E6); // Soft Cream (Warm White)

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    // Use a group to apply a slight scale transformation
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // Initial size update
    const updateSize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    container.appendChild(renderer.domElement);
    updateSize(); // Call once immediately

    // Plane Geometry covering the screen
    // We make it slightly larger to ensure coverage during distortion
    const geometry = new THREE.PlaneGeometry(3, 3, 128, 128); // Increased resolution for smoother blobs

    // Apply scale to the mesh group for "transform-scale" effect
    meshGroup.scale.set(1.5, 1.5, 1.5); // Increase scale

    // Vertex & Fragment Shaders for Liquid Effect
    const vertexShader = `
        varying vec2 vUv;
        varying float vElevation;
        uniform float uTime;

        // Simplex 3D Noise 
        // by Ian McEwan, Ashima Arts
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;

            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            //  x0 = x0 - 0.0 + 0.0 * C 
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

            // Permutations
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients
            // ( N=0.785398163397448309615660845819876 )
            float n_ = 1.0/7.0; // N/7.
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

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

            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            vUv = uv;
            
            // Movement logic
            vec3 pos = position;
            
            // Smoother, lower frequency for larger blobs
            float noiseFreq = 0.5; // Reduced from 0.8
            
            // Subtler amplitude
            float noiseAmp = 0.18; // Reduced from 0.25
            
            // Slower movement (time factor)
            float slowTime = uTime * 0.2; // Reduced speed factor
            
            vec3 noisePos = vec3(pos.x * noiseFreq + slowTime, pos.y * noiseFreq + slowTime * 1.5, slowTime);
            
            float elevation = snoise(noisePos) * noiseAmp;
            vElevation = elevation;
            
            // Pass vertex position to fragment shader for independent color blob mapping
            pos.z += elevation; 

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 uColor1; // Purple
        uniform vec3 uColor2; // Cyan
        uniform vec3 uColor3; // Orange
        uniform vec3 uColor4; // Cream
        
        varying float vElevation;
        varying vec2 vUv;

        // Random function for noise grain
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            // Map vElevation to distinct color zones for "independent blobs"
            // vElevation ranges roughly -0.18 to 0.18 (due to lower amp)
            
            // Normalize elevation to 0.0 - 1.0 range
            // Adjusted calculation for subtler range
            float mixStrength = (vElevation + 0.18) * 2.7; 
            
            vec3 color;
            
            // Adjusted thresholds to allow Cream to appear MORE often
            // Previous thresholds: 0.25, 0.5, 0.75
            
            // Zone 1: Purple (lowest) < 0.25 - reduced range
            // Zone 2: Cyan 0.25 - 0.45 - reduced range
            // Zone 3: Orange 0.45 - 0.65 - moved earlier
            // Zone 4: Cream > 0.65 - increased range significantly (now starts earlier)
            
            if (mixStrength < 0.25) {
                // Purple dominant
                color = uColor1;
            } else if (mixStrength < 0.45) {
                // Transition to Cyan
                float t = smoothstep(0.25, 0.45, mixStrength);
                color = mix(uColor1, uColor2, t);
            } else if (mixStrength < 0.65) {
                // Transition to Orange
                float t = smoothstep(0.45, 0.65, mixStrength);
                color = mix(uColor2, uColor3, t);
            } else {
                // Transition to Cream - starts much earlier now
                float t = smoothstep(0.65, 0.85, mixStrength);
                // Clamp t to 1.0 so everything above is pure cream
                t = min(t, 1.0);
                color = mix(uColor3, uColor4, t);
            }
            
            // Apply Grain Effect
            // Generate pseudo-random noise based on UV coordinates
            float noise = random(vUv * 99.0); // High frequency noise
            // Mix noise slightly into the color for grain texture
            color += (noise - 0.5) * 0.15; 
            
            // Add alpha based on position for softer edges if needed, but for full bg keep opaque-ish
            gl_FragColor = vec4(color, 0.6); // Slightly more opaque
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
            uColor4: { value: colorQuaternary }
        },
        transparent: true,
        // wireframe: true // debug
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshGroup.add(mesh); // Add mesh to the group to apply scale

    // Animation
    const clock = new THREE.Clock();

    const tick = () => {
        // Even slower animation multiplier
        const elapsedTime = clock.getElapsedTime() * 0.15; // Even slower!
        material.uniforms.uTime.value = elapsedTime;

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Resize
    // Use ResizeObserver for container resizing
    const resizeObserver = new ResizeObserver(() => {
        updateSize();
    });
    resizeObserver.observe(container);

    // Also listen to window resize as backup
    window.addEventListener('resize', updateSize);
});
