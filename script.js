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
    
    // SHADER TO CHANGE EVERYTHING TO YELLOW (HUE)
    spaceModel.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { value: child.material.map },
                    hueColor: { value: new THREE.Color(0xffff00) } // YELLOW
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D texture;
                    uniform vec3 hueColor;
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 texColor = texture2D(texture, vUv);
                        // Convert to grayscale and apply yellow hue
                        float gray = (texColor.r + texColor.g + texColor.b) / 3.0;
                        gl_FragColor = vec4(gray * hueColor, texColor.a);
                    }
                `,
                transparent: true
            });
        }
    });
    
    scene.add(spaceModel);
    spaceModel.scale.set(0.5, 0.5, 0.5); // SCALE KEPT
    spaceModel.position.z = -10;
    
    console.log('Space background loaded with YELLOW HUE!');
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



