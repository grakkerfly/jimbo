let scene, camera, renderer, jimboModel, spaceModel;
let isLaughing = false;
let isAnimating = false;
let laughAnimation = 0;
let laughSound;
let raycaster, mouse;
let currentScale = 2.5;
let targetScale = 2.5;

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

    const loader = new THREE.GLTFLoader();

    // Load Space background model
    loader.load('./3d/space.glb', function(gltf) {
        spaceModel = gltf.scene;
        scene.add(spaceModel);
        spaceModel.scale.set(0.5, 0.5, 0.5);
        spaceModel.position.z = -10;

    // yellow bg
        const overlayGeometry = new THREE.PlaneGeometry(100, 100);
        const overlayMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // AMARELO
        transparent: true,
        opacity: 0.3, // Intensidade do amarelo (ajusta de 0.1 a 0.8)
        blending: THREE.AdditiveBlending // Ou MultiplyBlending, ScreenBlending
    });
    
    const yellowOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    yellowOverlay.position.z = -9; // Na frente do espaço, atrás do Jimbo
    scene.add(yellowOverlay);
    
    console.log('Space background loaded with yellow overlay!');
});
    
    // Load Jimbo model
    loader.load('./3d/jimbo.glb', function(gltf) {
        jimboModel = gltf.scene;
        scene.add(jimboModel);
        
        jimboModel.scale.set(2.5, 2.5, 2.5);
        currentScale = 2.5;
        targetScale = 2.5;
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo AND Space follow mouse
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Jimbo follows mouse (ALWAYS, even when laughing)
        if (jimboModel) {
            jimboModel.rotation.y = mouseX * 0.5;
            jimboModel.rotation.x = -mouseY * 0.3;
        }
        
        // Space follows mouse with parallax (subtle movement)
        if (spaceModel) {
            spaceModel.rotation.y = mouseX * 0.1; // Much more subtle
            spaceModel.rotation.x = -mouseY * 0.05; // Much more subtle
        }
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
                // Start laughing with smooth zoom
                isLaughing = true;
                isAnimating = true;
                targetScale = 3.25;
                laughSound.play();
                laughAnimation = 0;
            } else {
                // Stop laughing with smooth zoom out
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

        // Smooth scale animation (zoom in/out)
        if (jimboModel && isAnimating) {
            currentScale += (targetScale - currentScale) * 0.15;
            jimboModel.scale.set(currentScale, currentScale, currentScale);
            
            if (Math.abs(targetScale - currentScale) < 0.01) {
                isAnimating = false;
                currentScale = targetScale;
                jimboModel.scale.set(currentScale, currentScale, currentScale);
            }
        }

        // Laugh head shaking (while still following mouse)
        if (jimboModel && isLaughing && !isAnimating) {
            laughAnimation += 0.08;
            jimboModel.rotation.x += Math.sin(laughAnimation * 4) * 0.02;
            jimboModel.rotation.y += Math.sin(laughAnimation * 3) * 0.01;
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

init();


