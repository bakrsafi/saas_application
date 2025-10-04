let scene, camera, renderer, building;
let angle = 0;
function init() {
    scene = new THREE.Scene();
    scene.background = null;
    const container = document.getElementById("building-3d");
    if (!container) return;

    camera = new THREE.PerspectiveCamera(
        73,
        container.offsetWidth / container.offsetHeight,
        0.1,
        1000
    );
    camera.position.set(3.5, 0, 0);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ✅ ضبط الحجم مباشرة بعد إرفاق الـ canvas
    onWindowResize();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const loader = new THREE.GLTFLoader();
    loader.load(
        "static/model/empire_state_building (1).glb",
        function (gltf) {
            building = gltf.scene;
            building.scale.set(0.02, 0.02, 0.02);
            const box = new THREE.Box3().setFromObject(building);
            const center = new THREE.Vector3();
            box.getCenter(center);
            building.position.sub(center);
            building.position.y += 0.2;
            scene.add(building);
        },
        undefined,
        function (error) {
            console.error("خطأ أثناء تحميل النموذج:", error);
        }
    );

    window.addEventListener("resize", onWindowResize);
    animate();
}
function animate() {
    requestAnimationFrame(animate);
    if (building) {
        angle += 0.005;
        const radius = 2.5;
        camera.position.x = Math.cos(angle) * radius;
        camera.position.z = Math.sin(angle) * radius;
        camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
}
function onWindowResize() {
    const container = document.getElementById("building-3d");
    if (!container) return;
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    menuToggle.classList.toggle("active");
});
document.addEventListener("DOMContentLoaded", init);