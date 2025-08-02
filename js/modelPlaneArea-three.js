import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";

// シーン作成
const scene = new THREE.Scene();

// オブジェクトエリアの要素を取得
const modelPlaneArea = document.getElementById("modelPlaneArea");
const modelPlaneAreaWidth = modelPlaneArea.clientWidth;
const modelPlaneAreaHeight = modelPlaneArea.clientHeight;

// カメラ設定
const camera = new THREE.PerspectiveCamera(
  75,
  modelPlaneAreaWidth / modelPlaneAreaHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

// レンダラー設定
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true, // 背景を透明に
});
renderer.setSize(modelPlaneAreaWidth, modelPlaneAreaHeight);
renderer.setClearColor(0x000000, 0); // 背景を完全に透明に
modelPlaneArea.appendChild(renderer.domElement);

// ライティング設定
const ambientLight = new THREE.AmbientLight(0xffffff, 7);
scene.add(ambientLight);

let model; // モデルをグローバルに保持

// モデルのロード
const loader = new GLTFLoader();
loader.load("model/plane/scene.gltf", function (gltf) {
  model = gltf.scene;
  resetModelPosition(); // 初期位置に設定
  scene.add(model);

  // 継続的な回転アニメーション
  function animate() {
    requestAnimationFrame(animate);
    if (model) {
      model.rotation.y += 0.005; // ゆっくりと回転
    }
    renderer.render(scene, camera);
  }
  animate();
});

// モデルを初期位置に戻す関数
function resetModelPosition() {
  if (!model) return;
  model.scale.set(0.2, 0.2, 0.2);
  model.position.set(5, 0, -20);
}

// モデルのアニメーションを開始する関数
function startModelAnimation() {
  if (!model) return;

  // 一度初期位置に戻す
  resetModelPosition();

  // アニメーションを開始
  gsap
    .timeline()
    .to(model.position, {
      x: 0, // 中央へ
      z: 0, // 手前へ
      duration: 2.5,
      ease: "power2.out",
    })
    .to(
      model.scale,
      {
        x: 0.7, // 最終的な大きさ
        y: 0.7,
        z: 0.7,
        duration: 2.5,
        ease: "power2.out",
      },
      "<"
    );
}

// セクション切り替えを監視
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

// ウィンドウリサイズ対応
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  const newWidth = modelPlaneArea.clientWidth;
  const newHeight = modelPlaneArea.clientHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
}
