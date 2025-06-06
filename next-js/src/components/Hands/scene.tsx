import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

function animate() {
  renderer.render(scene, camera);
}

export function render() {
  renderer.setSize(640, 480);
  renderer.domElement.style.border = "1px solid #4b5563";
  renderer.domElement.style.borderTop = "none";
  renderer.domElement.style.marginLeft = "642px";
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  show3DLandmark(true);

  camera.position.z = 5;

  return handsObj;
}

let sphereMat: any;
let showLandmark = true;
let handsObj: any;

function show3DLandmark(value: boolean) {
  if (!handsObj) {
    handsObj = new THREE.Object3D();
    scene.add(handsObj);

    createHand();
  }

  if (sphereMat) sphereMat.opacity = value ? 1 : 0;
}

function createHand() {
  sphereMat = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: showLandmark ? 1 : 0,
  });
  const sphereGeo = new THREE.SphereGeometry(0.025, 8, 4);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  for (let i = 0; i < 21; i++) {
    const sphereMeshClone = sphereMesh.clone();
    sphereMeshClone.renderOrder = 2;
    handsObj.add(sphereMeshClone);
  }
}
