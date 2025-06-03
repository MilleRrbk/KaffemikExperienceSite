// importerer nødvendige ting fra three og loaders
import * as THREE from 'three';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

// loader state til at vise intro popup når begge er klar
let isHdrLoaded = false;
let isModelLoaded = false;

function checkIfLoaded() {
    const loader = document.getElementById('loading-screen');
    const popup = document.getElementById('popup-box');

    if (isHdrLoaded && isModelLoaded && loader) {
        loader.classList.add('fade-out');
        popup.classList.add('visible');
    }
}

// opsætning af canvas, scene, kamera og renderer
const _canvasEl = document.getElementById("three");
const _vw = window.innerWidth;
const _vh = window.innerHeight;
const _scene = new THREE.Scene();
const _camera = new THREE.PerspectiveCamera(40, _vw / _vh, 0.1, 1000);
const isFast = navigator.hardwareConcurrency > 4;
const _renderer = new THREE.WebGLRenderer({ canvas: _canvasEl, antialias: isFast });
_renderer.setSize(_vw, _vh);
_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
_renderer.shadowMap.enabled = true;
_renderer.shadowMap.type = THREE.BasicShadowMap;
_renderer.toneMapping = THREE.ACESFilmicToneMapping;
_renderer.toneMappingExposure = 0.25;

// lys til hovedscenen
const _ambiLight = new THREE.AmbientLight(0xffd6e7, 1);
_scene.add(_ambiLight);

// loader exr-baggrund til scene og preview
const exrLoader = new EXRLoader();
exrLoader.load('/abovetheclouds.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    _scene.environment = texture;
    _scene.background = texture;
    previewScene.environment = texture;
    previewScene.background = null;
    isHdrLoaded = true;
    checkIfLoaded();
});

// funktion til at lave punktlys med shadows
function createPointLight(color, intensity, distance, position) {
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

// tilføjer forskellige lys i scenen
createPointLight(0xffedd6, 100, 40, [0, 20, 0]);
createPointLight(0xff8355, 40, 30, [0, 6, 0]);
createPointLight(0xff8b8b, 30, 30, [-4, 6, -3]);
createPointLight(0xffcf6f, 20, 5, [4.6, 4.5, 3.6]);
createPointLight(0xffcf6f, 5, 2.5, [-0.3, 3.5, 5.5]);
createPointLight(0xff9246, 2, 1, [0.35, 3.2, -0.4]);
createPointLight(0xff9246, 2, 1, [-0.1, 3.2, 0.8]);
createPointLight(0xff9246, 2, 1, [-0.6, 3.2, 0.3]);
const _pointLight = createPointLight(0xffffff, 20, 10, [0, 4, 0]);

// raycaster til klik og hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// navnene på objekterne man kan klikke på
const clickableNames = [
    "FiskeStang", "Present", "Hund", "Sko",
    "Tupilakker", "Chokoladekage", "Kransekage",
    "Mattak", "Metaltray"
];

// info og titler knyttet til hvert klikbart objekt
const infoMap = {
    FiskeStang: {
        title: "Fiskeri",
        text: "Fiskeri er en livsnerve i Grønland – ikke kun økonomisk, men også kulturelt. Omkring 90 % af landets eksport stammer fra fisk og skaldyr, og mange familier er afhængige af fiskeri som levevej. Fiskeri er en daglig aktivitet, der forbinder mennesker med naturen og deres forfædres traditioner.",
        model: "FiskeStang"
      },
      Present: {
        title: "Gave",
        text: "I en grønlandsk kaffemik er det almindeligt at medbringe en lille gave til værten – som et tegn på respekt og taknemmelighed. Gaverne er ofte symbolske: et kort, lidt penge eller noget hjemmelavet. Det handler ikke om værdien, men om gestussen og fællesskabet.",
        model: "Gaver"
      },
      Hund: {
        title: "Slædehund",
        text: "Slædehunde har været uundværlige i Grønland i over 4.000 år. De har hjulpet med jagt, transport og overlevelse i det barske arktiske klima. I dag er de stadig en del af livet i Øst- og Nordgrønland og symboliserer styrke, loyalitet og kulturarv.",
        model: "Hund"
      },
      Sko: {
        title: "Sælskindssko",
        text: "Traditionelle grønlandske sko, kendt som kamik, er lavet af sælskind og er både varme og vandtætte – perfekte til det arktiske klima. De er ofte dekoreret med farverige mønstre og er en vigtig del af den nationale dragt, især ved festlige lejligheder.",
        model: "Sko"
      },
      Tupilakker: {
        title: "Tupilak",
        text: "Tupilakker er små figurer, der oprindeligt blev lavet af shamaner for at sende ånder mod fjender. De blev skabt i hemmelighed af knogler, hud og andre materialer. I dag er de kunsthåndværk og symboliserer forbindelsen mellem det åndelige og det menneskelige.",
        model: "Tupilakker"
      },
      Chokoladekage: {
        title: "Chokoladekage",
        text: "Chokoladekage er en fast del af kaffemik – en social sammenkomst, hvor man fejrer livets begivenheder. Kagen repræsenterer hygge, fællesskab og glæden ved at dele.",
        model: "Chokoladekage"
      },
      Kransekage: {
        title: "Kransekage",
        text: "Kransekage, lavet af marcipan og pyntet med glasur, er en klassisk festkage i Grønland. Den serveres ved særlige lejligheder som nytår, bryllupper og konfirmationer og symboliserer fest og tradition.",
        model: "Kransekage"
      },
      Mattak: {
        title: "Mattak",
        text: "Mattak er en traditionel grønlandsk delikatesse bestående af hvalhud med et lag spæk. Den spises ofte rå og er rig på vitaminer og næringsstoffer. Mattak er en vigtig del af den grønlandske kost og kultur, især i kystsamfundene.",
        model: "Mattak"
      },
      Metaltray: {
        title: "Tørret fisk",
        text: "Tørret fisk er en klassisk grønlandsk snack, der er let at opbevare og tage med på jagt eller rejser. Den er rig på protein og symboliserer selvforsyning og respekt for naturens ressourcer.",
        model: "Metaltray"
      }
    };

// array til at samle alle klikbare objekter i scenen
const clickableObjects = [];

let previewMesh = null; // til preview modellen
let previewMeshInner = null;

// loader hele blender scenen
const _roomLoader = new GLTFLoader();
_roomLoader.load('/models/KaffemikV8.glb', (gltf) => {
    const _room = gltf.scene;
    _room.scale.set(1, 1, 1);
    _room.position.set(0, 1, 0);

    _room.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // tjekker om objektet matcher klikbare navne
            clickableNames.forEach(name => {
                if (child.name.includes(name) || child.parent?.name.includes(name)) {
                    child.userData.clickKey = name;
                    clickableObjects.push(child);
                }
            });
        }
    });

    console.log("✔️ Klikbare objekter fundet:", clickableObjects.map(o => o.name));
    _scene.add(_room);
    isModelLoaded = true;
    checkIfLoaded();
});

// her laver jeg en separat scene til preview-popuppen
const previewScene = new THREE.Scene();

// kameraet i preview-boksen, mindre fov og fast aspect-ratio
const previewCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
previewCamera.position.set(0, 0, 5);

// renderer til popup-previewet – med alpha så baggrunden kan være gennemsigtig
const previewRenderer = new THREE.WebGLRenderer({ alpha: true });

// henter DOM-elementet til preview-containeren
const previewContainer = document.getElementById("preview-container");
const previewWidth = previewContainer.clientWidth;
const previewHeight = previewContainer.clientHeight;

// sætter størrelse og opdaterer kameraets aspect-ratio
previewRenderer.setSize(previewWidth, previewHeight);
previewCamera.aspect = previewWidth / previewHeight;
previewCamera.updateProjectionMatrix();
previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// smider rendererens canvas ind i containeren
document.getElementById("preview-container").appendChild(previewRenderer.domElement);

// loader til preview-modellerne
const previewLoader = new GLTFLoader();

// her vises info-popuppen med tekst og evt. en preview-model
function showInfoPopup(title, text, meshTemplate = null) {
    const popup = document.getElementById("info-popup");
    document.getElementById("popup-title").innerText = title;
    document.getElementById("popup-text").innerText = text;
    popup.classList.add("visible");

    // fjerner tidligere preview-model
    if (previewMesh) {
        previewScene.remove(previewMesh);
        previewMesh = null;
        previewMeshInner = null;
    }

    // finder den rigtige fil ud fra infoMap (eller laver fallback med titel)
    const safeKey = Object.keys(infoMap).find(key => infoMap[key].title === title) || title.replace(/\s/g, '');
    const filename = `/models/previews/${infoMap[safeKey]?.model || safeKey}.glb`;

    // loader preview-modellen
    previewLoader.load(filename, (gltf) => {
        previewMesh = gltf.scene;
        previewMesh.scale.set(1, 1, 1);
        previewMesh.position.set(0, -0.3, 0); // justering

        // centrér modellen omkring (0,0,0)
        const box = new THREE.Box3().setFromObject(previewMesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        previewMesh.position.sub(center);

        // sæt kamera-afstand ud fra modelens størrelse
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        previewCamera.position.set(0, 0, maxDim * 2.5);
        previewCamera.lookAt(0, 0, 0);

        // sikrer materialet ikke er gennemsigtigt ved fejl
        previewMesh.traverse(child => {
            if (child.isMesh) {
                child.material.depthWrite = true;
                child.material.transparent = false;
                child.material.needsUpdate = true;
            }
        });

        // tilføj til preview-scenen
        previewScene.add(previewMesh);
        previewMeshInner = previewMesh;

        console.log("✔️ Model tilføjet:", filename, previewMesh);
    }, undefined, (err) => {
        console.warn("⚠️ Kunne ikke loade preview model:", filename, err);
    });
}

// tilføjer lidt ambient lys til preview-scenen
const previewLight = new THREE.AmbientLight(0xffffff, 1.5);
previewScene.add(previewLight);

// luk-popuppen når brugeren klikker på krydset
document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("info-popup").classList.remove("visible");
});

// når man klikker på noget, bruges raycasteren til at finde hvad der blev ramt
window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const name = mesh.userData.clickKey;

        if (name && infoMap[name]) {
            console.log("✅ Du klikkede på:", name);
            showInfoPopup(infoMap[name].title, infoMap[name].text, mesh);
        } else {
            console.warn("⚠️ Ingen infoMap match for:", mesh.name);
        }
    } else {
        console.log("❌ Ingen klikramt objekt");
    }
});

// ændrer cursor når man holder musen over klikbare objekter
window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
});

// roterer preview-modellen en lille smule i loop
function animatePopupObject() {
    requestAnimationFrame(animatePopupObject);
    if (previewMeshInner) previewMeshInner.rotation.y += 0.01;
    previewRenderer.render(previewScene, previewCamera);
}
animatePopupObject();

// render-loop til hovedscenen – begrænset til 20 fps for performance
let lastTime = 0;
const fps = 20;
const interval = 1000 / fps;

function animate(now = 0) {
    requestAnimationFrame(animate);
    if (now - lastTime < interval) return;
    lastTime = now;
    _pointLight.position.set(_camera.position.x, 8, _camera.position.z); // lyset følger kameraets x og z
    _renderer.render(_scene, _camera);
}
animate();

// sørger for at canvas og kamera opdateres når man ændrer vinduesstørrelse
function resized() {
    const _vw = window.innerWidth;
    const _vh = window.innerHeight;
    _camera.aspect = _vw / _vh;
    _camera.updateProjectionMatrix();
    _renderer.setSize(_vw, _vh);
}
window.addEventListener("resize", resized);
resized();

// sætter kameraets startposition og retning
_camera.position.set(-6.5, 6.5, -7);
_camera.rotation.y = THREE.MathUtils.degToRad(-150);
_camera.lookAt(.5, 2.6, 1);

// deg to rad – bare en helper-funktion jeg brugte engang
function dtr(d) {
    return d * (Math.PI / 180);
}

// skjul velkomst-popuppen når man klikker på "start"
window.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-visit-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const popup = document.getElementById('popup-box');
            popup.classList.remove('visible');
        });
    }
});
