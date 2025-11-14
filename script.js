let scene, camera, renderer, jimboModel;
let isLaughing = false;
let isAnimating = false;
let laughAnimation = 0;
let laughSound;
let raycaster, mouse;
let currentScale = 2.5;
let targetScale = 2.5;
let tunnel;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Load laugh sound (with loop)
    laughSound = new Audio('./laugh.mp3');
    laughSound.loop = true;

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // PSYCHEDELIC TUNNEL BACKGROUND
    createPsychTunnel();

    // Load Jimbo model
    const loader = new THREE.GLTFLoader();
    
    loader.load('./3d/jimbo.glb', function(gltf) {
        jimboModel = gltf.scene;
        scene.add(jimboModel);
        
        jimboModel.scale.set(2.5, 2.5, 2.5);
        currentScale = 2.5;
        targetScale = 2.5;
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo follows mouse
    document.addEventListener('mousemove', (e) => {
        if (!jimboModel || isLaughing || isAnimating) return;
        
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        jimboModel.rotation.y = mouseX * 0.5;
        jimboModel.rotation.x = -mouseY * 0.3;
    });

    // Click - ONLY on Jimbo
    document.addEventListener('click', (e) => {
        if (!jimboModel || isAnimating) return;
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(jimboModel, true);
        
        if (intersects.length > 0) {
            if (!isLaughing) {
                isLaughing = true;
                isAnimating = true;
                targetScale = 3.25;
                laughSound.play();
                laughAnimation = 0;
            } else {
                isLaughing = false;
                isAnimating = true;
                targetScale = 2.5;
                laughSound.pause();
                laughSound.currentTime = 0;
            }
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Animate tunnel rotation
        if (tunnel) {
            tunnel.rotation.z += 0.005;
            tunnel.rotation.x += 0.002;
        }

        if (jimboModel) {
            // Smooth scale animation
            if (isAnimating) {
                currentScale += (targetScale - currentScale) * 0.15;
                jimboModel.scale.set(currentScale, currentScale, currentScale);
                
                if (Math.abs(targetScale - currentScale) < 0.01) {
                    isAnimating = false;
                    currentScale = targetScale;
                    jimboModel.scale.set(currentScale, currentScale, currentScale);
                    
                    if (!isLaughing) {
                        jimboModel.rotation.x = 0;
                        jimboModel.rotation.y = 0;
                    }
                }
            }

            // Laugh head shaking
            if (isLaughing && !isAnimating) {
                laughAnimation += 0.08;
                jimboModel.rotation.x = Math.sin(laughAnimation * 4) * 0.05;
                jimboModel.rotation.y = Math.sin(laughAnimation * 3) * 0.03;
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createPsychTunnel() {
    const tunnelGroup = new THREE.Group();
    
    // Create multiple rings for the tunnel
    const ringCount = 30;
    const colors = [0xff006e, 0x3a86ff, 0xfb5607, 0x8338ec, 0x06d6a0];
    
    for (let i = 0; i < ringCount; i++) {
        const radius = 15 + i * 2;
        const tubeGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 50);
        const tubeMaterial = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            wireframe: true,
            transparent: true,
            opacity: 0.6 - (i * 0.02)
        });
        
        const ring = new THREE.Mesh(tubeGeometry, tubeMaterial);
        ring.position.z = -i * 3; // Position rings behind each other
        
        // Random rotation for each ring
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        
        tunnelGroup.add(ring);
    }
    
    // Add some floating particles in the tunnel
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Random positions inside tunnel
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 10;
        
        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle) * radius;
        positions[i + 2] = (Math.random() - 0.5) * 100 - 20;
        
        // Random colors
        const color = colors[Math.floor(Math.random() * colors.length)];
        particleColors[i] = ((color >> 16) & 255) / 255;
        particleColors[i + 1] = ((color >> 8) & 255) / 255;
        particleColors[i + 2] = (color & 255) / 255;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    tunnelGroup.add(particleSystem);
    
    scene.add(tunnelGroup);
    tunnel = tunnelGroup;
}

init();
