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
    const universeGroup = new THREE.Group();
    
    // Galaxy background - estrelas
    const starCount = 2000;
    const stars = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Posições aleatórias numa esfera grande
        const radius = 50 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i + 2] = radius * Math.cos(phi) - 80; // Mais pra trás
        
        // Cores de estrelas (branco, azul, amarelo)
        const starType = Math.random();
        if (starType < 0.7) {
            starColors[i] = 1; starColors[i + 1] = 1; starColors[i + 2] = 1; // Branco
        } else if (starType < 0.85) {
            starColors[i] = 0.7; starColors[i + 1] = 0.8; starColors[i + 2] = 1; // Azul
        } else {
            starColors[i] = 1; starColors[i + 1] = 0.9; starColors[i + 2] = 0.5; // Amarelo
        }
    }
    
    stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    stars.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        sizeAttenuation: true
    });
    
    const starField = new THREE.Points(stars, starMaterial);
    universeGroup.add(starField);
    
    // Nebulosa colorida - efeito de gás cósmico
    const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec2 uv = vUv * 2.0 - 1.0;
                float d = length(uv);
                
                // Cores de nebulosa (roxo, azul, rosa)
                vec3 color = mix(
                    mix(vec3(0.3, 0.1, 0.5), vec3(0.1, 0.2, 0.8), sin(time + uv.x * 3.0) * 0.5 + 0.5),
                    vec3(0.8, 0.2, 0.6),
                    cos(time + uv.y * 2.0) * 0.5 + 0.5
                );
                
                float alpha = (1.0 - d) * 0.1;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.BackSide
    });
    
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -50;
    universeGroup.add(nebula);
    
    // Planetas distantes
    const planetColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57];
    for (let i = 0; i < 8; i++) {
        const planetSize = Math.random() * 3 + 1;
        const planetGeometry = new THREE.SphereGeometry(planetSize, 16, 16);
        const planetMaterial = new THREE.MeshBasicMaterial({
            color: planetColors[i % planetColors.length],
            transparent: true,
            opacity: 0.7
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Posiciona planetas em órbitas aleatórias
        const orbitRadius = 30 + Math.random() * 40;
        const angle = Math.random() * Math.PI * 2;
        planet.position.x = Math.cos(angle) * orbitRadius;
        planet.position.y = Math.sin(angle) * orbitRadius * 0.3;
        planet.position.z = -60 - Math.random() * 30;
        
        universeGroup.add(planet);
    }
    
    scene.add(universeGroup);
    tunnel = universeGroup;
    
    // Atualiza o shader da nebulosa
    function updateNebula() {
        nebulaMaterial.uniforms.time.value += 0.01;
    }
    
    // Adiciona atualização contínua
    setInterval(updateNebula, 50);
}

init();
