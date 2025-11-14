let scene, camera, renderer, jimboModel, spaceModel;
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
        
        // Ajusta o espaço pro background
        spaceModel.scale.set(50, 50, 50); // Scale up for background
        spaceModel.position.z = -100; // Move far back
        spaceModel.rotation.x = Math.PI / 6; // Slight tilt for better view
        
        console.log('Space 3D background loaded successfully!');
    });

    // Load Jimbo model
    loader.load('./3d/jimbo.glb', function(gltf) {
        jimboModel = gltf.scene;
        scene.add(jimboModel);
        
        jimboModel.scale.set(2.5, 2.5, 2.5);
        jimboModel.position.y = 0;
        
        console.log('Jimbo 3D loaded successfully!');
    });

    // Mouse move - Jimbo follows mouse
    document.addEventListener('mousemove', (e) => {
        if (!jimboModel || isLaughing) return;
        
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        jimboModel.rotation.y = mouseX * 0.5;
        jimboModel.rotation.x = -mouseY * 0.3;
    });

    // Click - ONLY on Jimbo
    document.addEventListener('click', (e) => {
        if (!jimboModel) return;
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(jimboModel, true);
        
        if (intersects.length > 0) {
            if (!isLaughing) {
                isLaughing = true;
                jimboModel.scale.set(3.25, 3.25, 3.25);
                laughSound.play();
                laughAnimation = 0;
            } else {
                isLaughing = false;
                jimboModel.scale.set(2.5, 2.5, 2.5);
                laughSound.pause();
                laughSound.currentTime = 0;
                
                jimboModel.rotation.x = 0;
                jimboModel.rotation.y = 0;
            }
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate space background slowly
        if (spaceModel) {
            spaceModel.rotation.y += 0.001; // Very slow rotation
        }

        if (jimboModel && isLaughing) {
            laughAnimation += 0.08;
            jimboModel.rotation.x = Math.sin(laughAnimation * 4) * 0.05;
            jimboModel.rotation.y = Math.sin(laughAnimation * 3) * 0.03;
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

init();```
