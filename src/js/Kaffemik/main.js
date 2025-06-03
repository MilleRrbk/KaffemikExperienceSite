import * as THREE from 'three';
import GUI from 'lil-gui';
import Stats from 'three/addons/libs/stats.module.js'; // fps performance display
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

var _canvasEl = document.getElementById("three");

// set viewport size
var _vw = window.innerWidth;
var _vh = window.innerHeight;

// create scene and camera
const _scene = new THREE.Scene();
const _camera = new THREE.PerspectiveCamera(40, _vw / _vh, 0.1, 1000);
const _renderer = new THREE.WebGLRenderer({ canvas: _canvasEl, antialias: true });
_renderer.setSize(_vw, _vh);
_renderer.setPixelRatio(window.devicePixelRatio);
_renderer.shadowMap.enabled = true; // enable shadows
_renderer.shadowMap.type = THREE.PCFShadowMap; // best performance setting
_renderer.toneMapping = THREE.ACESFilmicToneMapping;
_renderer.toneMappingExposure = 0.3; // adjust hdri brightness

var _stats = new Stats();
document.body.appendChild(_stats.dom);

// add axis helper
const _axeshelper = new THREE.AxesHelper(2);
_scene.add(_axeshelper);

// add ambient light
const _ambiLight = new THREE.AmbientLight(0xffd6e7, 1);
_scene.add(_ambiLight);

// load exr 
const exrLoader = new EXRLoader();
exrLoader.load('/abovetheclouds.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    _scene.environment = texture;
    _scene.background = texture;
});

function createPointLight(color, intensity, distance, position, addHelper = false) {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(...position);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.bias = -0.003;
    light.shadow.camera.near = 3;
    light.shadow.camera.far = 20;
    _scene.add(light);
    return light;
}

// create all lights using createPointLight function
const overallLight = createPointLight(0xffedd6, 100, 40, [0, 20, 0], true);
const ceilingLight = createPointLight(0xff8355, 40, 30, [0, 6, 0], true);
const extraLight = createPointLight(0xff8b8b, 30, 30, [-4, 6, -3], true);
const floorLight = createPointLight(0xffcf6f, 20, 5, [4.6, 4.5, 3.6], true);
const tableLight = createPointLight(0xffcf6f, 5, 2.5, [-0.3, 3.5, 5.5], true);
const candleLight = createPointLight(0xff9246, 2, 1, [0.35, 3.2, -0.4], true);
const candle2Light = createPointLight(0xff9246, 2, 1, [-0.1, 3.2, 0.8], true);
const candle3Light = createPointLight(0xff9246, 2, 1, [-0.6, 3.2, 0.3], true);
const _pointLight = createPointLight(0xffffff, 20, 10, [0, 4, 0], true);

// load 3d room model
const _roomLoader = new GLTFLoader();
_roomLoader.load('/models/Kaffemikv3.glb', (gltf) => {
    const _room = gltf.scene;
    _room.scale.set(1, 1, 1);
    _room.position.set(0, 1, 0);

    _room.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

        }
    });
 

    _scene.add(_room);
    console.log("model loaded successfully");
}, undefined, function (error) {
    console.error("failed to load model:", error);
});

// animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // ensure the point light follows the camera (if needed)
    _pointLight.position.set(_camera.position.x, 8, _camera.position.z);

    _renderer.render(_scene, _camera);
    _stats.update();
}
animate();

// update viewport on window resize
function resized() {
    var _vw = window.innerWidth;
    var _vh = window.innerHeight;
    _camera.aspect = _vw / _vh;
    _camera.updateProjectionMatrix();
    _renderer.setSize(_vw, _vh);
}
window.addEventListener("resize", resized);
resized();

// initialize camera position & rotation
_camera.position.set(-6.5, 6.2, -7);
_camera.rotation.y = THREE.MathUtils.degToRad(-150);
_camera.lookAt(.5, 2.5, 1);

// utility functions
function dtr(d) {
    return d * (Math.PI / 180);
}
