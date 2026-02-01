
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded.');
        return;
    }

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '1';
    document.body.appendChild(renderer.domElement);

    // --- Starfield Layer (Brighter & Larger) ---
    const totalStars = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(totalStars * 3);
    const starScales = new Float32Array(totalStars);
    const starPhases = new Float32Array(totalStars);
    const starColors = new Float32Array(totalStars * 3);
    const starIsNormal = new Float32Array(totalStars);

    const celestialColors = [
        new THREE.Color('#fff4e0'), new THREE.Color('#e0f4ff'), new THREE.Color('#ffffff'), new THREE.Color('#ffd700'),
    ];

    for (let i = 0; i < totalStars; i++) {
        starPositions[i * 3 + 0] = (Math.random() - 0.5) * 125;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 105;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;

        starScales[i] = 0.6 + Math.random() * 0.9; // Slightly larger base scale
        starPhases[i] = Math.random() * Math.PI * 2;
        starIsNormal[i] = Math.random() < 0.15 ? 1.0 : 0.0;
        const color = celestialColors[Math.floor(Math.random() * celestialColors.length)];
        starColors[i * 3 + 0] = color.r;
        starColors[i * 3 + 1] = color.g;
        starColors[i * 3 + 2] = color.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('aScale', new THREE.BufferAttribute(starScales, 1));
    starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    starGeometry.setAttribute('aIsNormal', new THREE.BufferAttribute(starIsNormal, 1));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
        vertexShader: `
            uniform float uTime; uniform float uPixelRatio;
            attribute float aScale; attribute float aPhase; attribute float aIsNormal;
            varying float vAlpha; varying vec3 vColor; attribute vec3 color;
            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                modelPosition.x += sin(uTime * 0.02 + aPhase) * 0.05;
                modelPosition.y += cos(uTime * 0.02 + aPhase) * 0.05;
                vec4 viewPosition = viewMatrix * modelPosition;
                gl_Position = projectionMatrix * viewPosition;
                
                float twinkle = sin(uTime * 1.5 + aPhase) * 0.5 + 0.5;
                float tF = mix(twinkle, 1.0, aIsNormal);
                
                // --- Size Boosted ---
                gl_PointSize = 6.4 * aScale * uPixelRatio * (0.6 + 0.4 * tF);
                gl_PointSize *= (1.0 / - viewPosition.z);
                
                // --- Brightness Boosted ---
                vAlpha = mix(0.2 + 0.8 * twinkle, 0.85, aIsNormal);
                vColor = color;
            }
        `,
        fragmentShader: `
            varying vec3 vColor; varying float vAlpha;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                float s = 0.05 / d - 0.1;
                gl_FragColor = vec4(vColor, s * vAlpha);
            }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(starGeometry, starMaterial));

    // --- Fireflies (Brighter & More Apparent) ---
    const fireflyCount = 70;
    const fireflyGeometry = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyPhases = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
        fireflyPositions[i * 3 + 0] = (Math.random() - 0.5) * 45;
        fireflyPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
        fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 15;
        fireflyPhases[i] = Math.random() * Math.PI * 2;
    }
    fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
    fireflyGeometry.setAttribute('aPhase', new THREE.BufferAttribute(fireflyPhases, 1));
    const fireflyMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
        vertexShader: `
            uniform float uTime; uniform float uPixelRatio;
            attribute float aPhase; varying float vAlpha;
            void main() {
                vec4 mPos = modelMatrix * vec4(position, 1.0);
                mPos.x += sin(uTime * 0.4 + aPhase) * 1.6;
                mPos.y += cos(uTime * 0.25 + aPhase) * 1.1;
                vec4 vPos = viewMatrix * mPos;
                gl_Position = projectionMatrix * vPos;
                
                float pulse = (sin(uTime * 0.7 + aPhase) + 1.0) * 0.5;
                
                // --- Size Boosted ---
                gl_PointSize = 85.0 * pulse * uPixelRatio;
                gl_PointSize *= (1.0 / - vPos.z);
                
                // --- Brightness Boosted ---
                vAlpha = 0.2 + pulse * 0.75; 
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                float s = 0.05 / d - 0.1;
                gl_FragColor = vec4(1.0, 0.95, 0.6, s * vAlpha); // Richer warm glow
            }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(fireflyGeometry, fireflyMaterial));

    // --- Curved Shooting Stars ---
    const maxShootingStars = 4;
    const shootingStars = [];

    const curveVertexShader = `
        uniform float uT;
        uniform float uStartX;
        uniform float uStartY;
        uniform float uArcWidth;
        uniform float uPeakHeight;
        uniform float uTrailLengthFactor;
        varying vec2 vUv;
        vec2 getPathPos(float t) {
            float x = uStartX + t * uArcWidth;
            float y = uStartY + uPeakHeight * (1.0 - pow(2.0 * t - 1.0, 2.0));
            return vec2(x, y);
        }
        void main() {
            vUv = uv;
            float vertexT = uT - (uv.y * uTrailLengthFactor);
            vec2 pathPos = getPathPos(vertexT);
            vec2 nextPos = getPathPos(vertexT + 0.001);
            vec2 dir = normalize(nextPos - pathPos);
            vec2 normal = vec2(-dir.y, dir.x);
            vec2 finalPos = pathPos + normal * position.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos.x, finalPos.y, position.z, 1.0);
        }
    `;

    const curveFragmentShader = `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
            float trail = pow(1.0 - vUv.y, 4.0);
            float headGlow = exp(-vUv.y * 25.0) * 2.0;
            float strength = trail + headGlow;
            float widthTaper = 1.0 - abs(vUv.x * 2.5);
            strength *= max(0.0, widthTaper);
            gl_FragColor = vec4(uColor, strength * uOpacity);
        }
    `;

    class ShootingStar {
        constructor() { this.init(); }
        init() {
            const geometry = new THREE.PlaneBufferGeometry(0.3, 1, 1, 32);
            this.material = new THREE.ShaderMaterial({
                uniforms: { uT: { value: 0 }, uStartX: { value: 0 }, uStartY: { value: 0 }, uArcWidth: { value: 0 }, uPeakHeight: { value: 0 }, uTrailLengthFactor: { value: 0.1 }, uColor: { value: new THREE.Color() }, uOpacity: { value: 0 } },
                vertexShader: curveVertexShader, fragmentShader: curveFragmentShader,
                transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
            });
            this.mesh = new THREE.Mesh(geometry, this.material);
            this.mesh.frustumCulled = false;
            scene.add(this.mesh);
            this.reset();
        }
        reset() {
            this.active = false;
            this.delay = Math.random() * 60 + 20;
            this.t = -0.1;
            this.speed = 0.0005 + Math.random() * 0.001; // Significantly slower speed
            const fromLeft = Math.random() > 0.5;
            this.startX = fromLeft ? -50 - Math.random() * 10 : 50 + Math.random() * 10;
            this.startY = -30 - Math.random() * 10;
            this.arcWidth = (fromLeft ? 1 : -1) * (80 + Math.random() * 60);
            this.peakHeight = 25 + Math.random() * 20;
            this.trailLengthFactor = 0.08 + Math.random() * 0.07;
            const starColors = ['#ffffff', '#fff4e0', '#ffd700', '#ffeeaa'];
            this.material.uniforms.uColor.value.set(starColors[Math.floor(Math.random() * starColors.length)]);
            this.material.uniforms.uStartX.value = this.startX;
            this.material.uniforms.uStartY.value = this.startY;
            this.material.uniforms.uArcWidth.value = this.arcWidth;
            this.material.uniforms.uPeakHeight.value = this.peakHeight;
            this.material.uniforms.uTrailLengthFactor.value = this.trailLengthFactor;
        }
        update() {
            if (!this.active) {
                this.delay--;
                if (this.delay <= 0) this.active = true;
                return;
            }
            this.t += this.speed;
            this.material.uniforms.uT.value = this.t;
            let opacity = 0;
            if (this.t < 0.1) {
                opacity = this.t / 0.1;
            } else {
                opacity = 1.0 - ((this.t - 0.1) / 0.8);
            }
            opacity = Math.max(0, opacity);
            // Apply easing to make the fade-out smoother and more transparent-looking
            this.material.uniforms.uOpacity.value = Math.pow(opacity, 1.5) * 0.85;
            if (this.t >= 1.2) this.reset();
        }
    }

    for (let i = 0; i < maxShootingStars; i++) shootingStars.push(new ShootingStar());

    const clock = new THREE.Clock();
    const tick = () => {
        const elapsed = clock.getElapsedTime();
        starMaterial.uniforms.uTime.value = elapsed;
        fireflyMaterial.uniforms.uTime.value = elapsed;
        shootingStars.forEach(s => s.update());
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
