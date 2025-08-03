import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";

// シーン作成
const scene = new THREE.Scene();

// オブジェクトエリア取得
const modelPlaneArea = document.getElementById("modelPlaneArea");
const modelPlaneAreaWidth = modelPlaneArea.clientWidth;
const modelPlaneAreaHeight = modelPlaneArea.clientHeight;

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  modelPlaneAreaWidth / modelPlaneAreaHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

// レンダラー
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(modelPlaneAreaWidth, modelPlaneAreaHeight);
renderer.setClearColor(0x000000, 0);
modelPlaneArea.appendChild(renderer.domElement);

// ライティング
const ambientLight = new THREE.AmbientLight(0xffffff, 7);
scene.add(ambientLight);

// モデルとラッパー
let model;
let modelWrapper;
let animationFinished = false;

// モデル読み込み
const loader = new GLTFLoader();
loader.load("model/plane/scene.gltf", function (gltf) {
  model = gltf.scene;

model.rotation.set(Math.PI / 2, Math.PI / 2, -Math.PI / 2); // ←ここでモデル本体に回転を設定

  modelWrapper = new THREE.Group();
  modelWrapper.add(model);

  resetModelPosition();
  scene.add(modelWrapper);

  animate();
});

// 初期位置リセット
function resetModelPosition() {
  if (!modelWrapper) return;
  modelWrapper.scale.set(0.2, 0.2, 0.2);
  modelWrapper.position.set(5, 2, -20);
  modelWrapper.quaternion.identity(); // 向きリセット（アニメーションのため）
}

// アニメーション開始
function startModelAnimation() {
  if (!modelWrapper) return;

  resetModelPosition();
  animationFinished = false;

  const duration = 5;
  const fps = 60;
  const totalFrames = duration * fps;
  let frame = 0;

  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(5, 2, -20),
      new THREE.Vector3(3, -1, -15),
      new THREE.Vector3(-2, 2, -8),
      new THREE.Vector3(0, 0, 0),
    ],
    false,
    "centripetal"
  );

  const targetScale = new THREE.Vector3(0.7, 0.7, 0.7);

  const move = () => {
    if (!modelWrapper) return;

    const t = frame / totalFrames;
    const position = curve.getPoint(t);
    const tangent = curve.getTangent(t);

    modelWrapper.position.copy(position);

    const lookTarget = position.clone().add(tangent);
    const targetQuaternion = new THREE.Quaternion();
    modelWrapper.lookAt(lookTarget);
    targetQuaternion.copy(modelWrapper.quaternion);

    modelWrapper.quaternion.slerp(targetQuaternion, 0.1);

    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(move);
    } else {
      animationFinished = true;
    }
  };

  move();

  // スケール補間
  gsap.to(modelWrapper.scale, {
    x: targetScale.x,
    y: targetScale.y,
    z: targetScale.z,
    duration: duration,
    ease: "power2.out",
  });
}

// レンダリングループ
function animate() {
  requestAnimationFrame(animate);

  if (modelWrapper && animationFinished) {
    modelWrapper.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// セクション監視
const planeSection = document
  .querySelector("#modelPlaneArea")
  .closest(".js-section");

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      if (planeSection.classList.contains("is-show")) {
        startModelAnimation();
      }
    }
  });
});
observer.observe(planeSection, {
  attributes: true,
});

// リサイズ対応
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  const newWidth = modelPlaneArea.clientWidth;
  const newHeight = modelPlaneArea.clientHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
}
