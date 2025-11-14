let scene, camera, renderer, jimboModel;
let isLaughing = false;
let laughAnimation = 0;
let laughSound;
let raycaster, mouse;

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
    laughSound.loop = true; // REPEAT UNTIL STOP

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Load Space background model
    const loader = new THREE.GLTFLoader();
    loader.load('./3d/space.glb', function(gltf) {
        const spaceModel = gltf.scene;
        scene.add(spaceModel);
        spaceModel.position.z = -10; // Coloca atrás do Jimbo
        console.log('Space background loaded!');
    });
    
    // Load Jimbo model
    loader.load('./3d/jimbo.glb', function(gltf) {
        jimboModel = gltf.scene;
        scene.add(jimboModel);
        
        jimboModel.scale.set(2.5, 2.5, 2.5);
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo follows mouse (FULLY CORRECTED)
    document.addEventListener('mousemove', (e) => {
        if (!jimboModel || isLaughing) return;
        
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // FINAL CORRECTION - ALL DIRECTIONS CORRECT
        jimboModel.rotation.y = mouseX * 0.5; // Left/Right FIXED (no negative)
        jimboModel.rotation.x = -mouseY * 0.3; // Up/Down correct
    });

    // Click - ONLY on Jimbo
    document.addEventListener('click', (e) => {
        if (!jimboModel) return;
        
        // Calculate mouse position in normalized device coordinates
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Check if click is on Jimbo
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(jimboModel, true);
        
        if (intersects.length > 0) {
            // Click is on Jimbo - toggle laugh
            if (!isLaughing) {
                // Start laughing
                isLaughing = true;
                jimboModel.scale.set(3.25, 3.25, 3.25);
                laughSound.play();
                laughAnimation = 0;
            } else {
                // Stop laughing
                isLaughing = false;
                jimboModel.scale.set(2.5, 2.5, 2.5);
                laughSound.pause();
                laughSound.currentTime = 0;
                
                // Reset rotation for mouse following
                jimboModel.rotation.x = 0;
                jimboModel.rotation.y = 0;
            }
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (jimboModel && isLaughing) {
            // Slow head shaking
            laughAnimation += 0.08;
            jimboModel.rotation.x = Math.sin(laughAnimation * 4) * 0.05;
            jimboModel.rotation.y = Math.sin(laughAnimation * 3) * 0.03;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();
