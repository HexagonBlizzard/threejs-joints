import * as THREE from 'three';
import { setSkySphere_JPG } from '/helpers/SkysphereHelper.js'
const imagePath = '/images/vp_sky_v2_002.jpg';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1100);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const handSize = 60;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove);

function init(){
    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(ambientLight);
    setSkySphere_JPG(scene, imagePath);
}
init();
const textureLoader = new THREE.TextureLoader();
const planeTexture = textureLoader.load('/images/dagestan-2.jpg', function(tex){
  tex.needsUpdate = true;
});
planeTexture.wrapS = THREE.RepeatWrapping;
planeTexture.wrapT = THREE.RepeatWrapping;
planeTexture.repeat.set(40, 40);

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: planeTexture,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.z = Math.PI / 2;
scene.add(planeMesh);

const plane = new THREE.Plane();
const normal = new THREE.Vector3(0, 0, 1);
plane.setFromNormalAndCoplanarPoint(normal, planeMesh.position);

const geometry = new THREE.IcosahedronGeometry(0.1, 2);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
camera.position.z = 10;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let intersectionPoint = new THREE.Vector3();

let vectors = [];
let spheres = [];
for (let i = 0; i < handSize; i++){
  vectors.push(new THREE.Vector3(0, 0, 1))
}
for (let i = 0; i < handSize + 1; i++){
  spheres.push(new THREE.Mesh(geometry, material))
  scene.add(spheres[i]);
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    console.log(e.key.toLowerCase())
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function animate() {
  raycaster.setFromCamera(mouse, camera);
  const point = raycaster.ray.intersectPlane(plane, intersectionPoint);
  let normalizedPoint = new THREE.Vector3();
  normalizedPoint.copy(point);
  normalizedPoint.normalize();
  let pos = new THREE.Vector3();
  if (point){
    sphere.position.copy(point);
    for (let i = 0; i < vectors.length; i++){
      pos.add(vectors[i]);
      let targetVectorNormalizedRelative = new THREE.Vector3();
      targetVectorNormalizedRelative.copy(point);
      targetVectorNormalizedRelative.sub(pos);
      targetVectorNormalizedRelative.normalize();
      let temp = new THREE.Vector3().crossVectors(vectors[i], targetVectorNormalizedRelative);
      temp.cross(vectors[i]);
      vectors[i].add(temp.multiplyScalar(0.1));
      vectors[i].normalize();
      spheres[i+1].position.copy(pos);
    }
  }
  if (keys['q']){
    planeMesh.position.z -= 0.1;
    plane.setFromNormalAndCoplanarPoint(normal, planeMesh.position);
  }
  if (keys['e']){
    planeMesh.position.z += 0.1;
    plane.setFromNormalAndCoplanarPoint(normal, planeMesh.position);
  }
  if (keys['w']){
    camera.position.z -= 0.1;
  }
  if (keys['s']){
    camera.position.z += 0.1;
  }
  if (keys['a']){
    camera.position.x -= 0.1;
  }
  if (keys['d']){
    camera.position.x += 0.1;
  }
  if (keys['shift']){
    camera.position.y -= 0.1;
  }
  if (keys[' ']){
    camera.position.y += 0.1;
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);