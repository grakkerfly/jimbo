let scene, camera, renderer, jimboModel;

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
        
        // Adjust scale and position
        jimboModel.scale.set(2, 2, 2);
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    }, undefined, function(error) {
        console.error('Error loading model:', error);
    });

    // Mouse controls
    let mouseX = 0, mouseY = 0;
    let isMouseDown = false;

    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
    document.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        }
    });

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        if (jimboModel) {
            // Rotation with mouse + automatic
            jimboModel.rotation.y += (mouseX * 0.02 - jimboModel.rotation.y) * 0.1;
            jimboModel.rotation.x += (mouseY * 0.02 - jimboModel.rotation.x) * 0.1;
            jimboModel.rotation.y += 0.005;
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