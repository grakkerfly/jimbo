let scene, camera, renderer, jimboModel;
let isClicked = false;
let originalScale = new THREE.Vector3();
let laughAnimation = 0;

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Load Jimbo model
    const loader = new THREE.GLTFLoader();
    
    loader.load('./3d/jimbo.glb', function(gltf) {
        jimboModel = gltf.scene;
        scene.add(jimboModel);
        
        // Initial scale and position
        jimboModel.scale.set(2, 2, 2);
        originalScale.copy(jimboModel.scale);
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo follows mouse
    document.addEventListener('mousemove', (e) => {
        if (!jimboModel || isClicked) return;
        
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Smooth follow
        jimboModel.rotation.y = mouseX * 0.3;
        jimboModel.rotation.x = mouseY * 0.2;
    });

    // Click - Jimbo comes closer and laughs
    document.addEventListener('click', () => {
        if (!jimboModel) return;
        
        isClicked = true;
        
        // Zoom in (150%)
        jimboModel.scale.set(
            originalScale.x * 1.5,
            originalScale.y * 1.5, 
            originalScale.z * 1.5
        );
        
        // Start laugh animation
        laughAnimation = 0;
        
        // Return to normal after 2 seconds
        setTimeout(() => {
            isClicked = false;
            jimboModel.scale.copy(originalScale);
        }, 2000);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (jimboModel && isClicked) {
            // Fast up-down movement (laughing)
            laughAnimation += 0.5;
            jimboModel.position.y = Math.sin(laughAnimation * 10) * 0.1; // Small movement
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

// Initialize
init();
