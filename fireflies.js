
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded.');
        return;
    }

    // Create Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Style the canvas to sit on top (or behind) the content
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none'; // Click through
    renderer.domElement.style.zIndex = '50'; // Above background, below some UI maybe? Or just on top. 
    // Given the request for "glowing fireflies", on top is usually best for the effect.
    // However, header z-index is 1000. Let's make this 999 so it's under the header/nav but over the page content
    // actually, let's put it at z-index 1 so it's above the background but below text if possible?
    // If I put it high, it might obscure text if the particles are big.
    // Let's go with z-index: 1 and see. The parchment background is often z-index -1 or body background.
    // styles.css says .hero-image-container is z-index -1. .faded-parchment is z-index 1. 
    // So if we want fireflies to be visible over the parchment, we need z-index > 1. 
    // Text content usually flows naturally.
    // Let's try z-index: 10 but with blending.
    renderer.domElement.style.zIndex = '10';

    document.body.appendChild(renderer.domElement);

    // Fireflies Geometry
    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesCount = 150;
    const positionArray = new Float32Array(firefliesCount * 3);
    const scaleArray = new Float32Array(firefliesCount);
    // Add phase for blinking animation
    const phaseArray = new Float32Array(firefliesCount);
    // Add per-particle color
    const colorArray = new Float32Array(firefliesCount * 3);

    const color1 = new THREE.Color('#ffaa00'); // Standard Gold
    const color2 = new THREE.Color('#ff7700'); // Vibrant Orange (Less Red)
    const color3 = new THREE.Color('#ffcc00'); // Bright Yellow

    for (let i = 0; i < firefliesCount; i++) {
        positionArray[i * 3 + 0] = (Math.random() - 0.5) * 20; // x
        positionArray[i * 3 + 1] = (Math.random() - 0.5) * 10; // y. Keep closer to vertical center initially
        positionArray[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

        scaleArray[i] = Math.random();
        phaseArray[i] = Math.random() * Math.PI * 2;

        // Randomly assign colors: 60% Standard, 20% Bold, 20% Bright
        const randomColor = Math.random();
        let selectedColor;
        if (randomColor < 0.6) {
            selectedColor = color1;
        } else if (randomColor < 0.8) {
            selectedColor = color2; // The "Bolder" ones
            scaleArray[i] *= 1.2; // Make bold ones slightly larger too
        } else {
            selectedColor = color3;
        }

        colorArray[i * 3 + 0] = selectedColor.r;
        colorArray[i * 3 + 1] = selectedColor.g;
        colorArray[i * 3 + 2] = selectedColor.b;
    }

    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));
    firefliesGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phaseArray, 1));
    firefliesGeometry.setAttribute('aColor', new THREE.BufferAttribute(colorArray, 3));

    // Material (Shader for custom glow/blink)
    // Using a shader material allows for efficient handling of the blinking/glowing logic on GPU
    const firefliesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: 150 }, // Base size
        },
        vertexShader: `
            uniform float uTime;
            uniform float uPixelRatio;
            uniform float uSize;

            attribute float aScale;
            attribute float aPhase;
            attribute vec3 aColor;
            
            varying float vAlpha;
            varying vec3 vColor;

            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
                // Add some gentle wave motion
                modelPosition.y += sin(uTime + modelPosition.x * 100.0) * 0.2 * aScale;
                modelPosition.x += cos(uTime + modelPosition.y * 10.0) * 0.1 * aScale;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectionPosition = projectionMatrix * viewPosition;

                gl_Position = projectionPosition;
                
                gl_PointSize = uSize * aScale * uPixelRatio;
                // Size attenuation (objects get smaller when further away)
                gl_PointSize *= (1.0 / - viewPosition.z);

                // Blinking effect
                vAlpha = (sin(uTime * 1.5 + aPhase) + 1.0) * 0.5;
                vColor = aColor;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Circular particle drawing
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float strength = 0.05 / distanceToCenter - 0.1;

                gl_FragColor = vec4(vColor, strength * vAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
    scene.add(fireflies);

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Update uniforms
        firefliesMaterial.uniforms.uTime.value = elapsedTime;

        // Render
        renderer.render(scene, camera);

        window.requestAnimationFrame(tick);
    }

    tick();
});
