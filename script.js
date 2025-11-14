let scene, camera, renderer, jimboModel;
let isLaughing = false;
let laughAnimation = 0;
let laughSound;

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

    // Load laugh sound
    laughSound = new Audio('./laugh.mp3');

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
        
        jimboModel.scale.set(2, 2, 2);
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo follows mouse (CORRECTED DIRECTIONS)
    document.addEventListener('mousemove', (e) => {
        if (!jimboModel || isLaughing) return;
        
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // CORRECTED: same direction as mouse
        jimboModel.rotation.y = -mouseX * 0.5; // Fixed X direction
        jimboModel.rotation.x = mouseY * 0.3;  // Fixed Y direction
    });

    // Click - Toggle laugh mode
    document.addEventListener('click', () => {
        if (!jimboModel) return;
        
        if (!isLaughing) {
            // Start laughing
            isLaughing = true;
            jimboModel.scale.set(3, 3, 3);
            laughSound.play();
            laughAnimation = 0;
        } else {
            // Stop laughing
            isLaughing = false;
            jimboModel.scale.set(2, 2, 2);
            laughSound.pause();
            laughSound.currentTime = 0;
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (jimboModel && isLaughing) {
            // Slower head shaking (LESS FRENETIC)
            laughAnimation += 0.15;
            jimboModel.rotation.x = Math.sin(laughAnimation * 8) * 0.08; // Slower and smaller
            jimboModel.rotation.y = Math.sin(laughAnimation * 6) * 0.04; // Slower and smaller
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
