import * as THREE from 'three';
import { loadingManager } from './loadingManager.js';

// シーン、カメラ、レンダラーを作成
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const background = document.getElementById('background');
renderer.setSize(window.innerWidth, window.innerHeight);
background.appendChild(renderer.domElement);

// ランダムな色を生成
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// 泡の配列
const bubbles = [];
let speedMultiplier = 1;  // 速度の倍率を管理する変数

// 泡の速度を変更する関数をグローバルスコープで利用可能にする
// main.js内のchangeBubblesSpeed関数で速度を変更する
window.changeBubblesSpeed = function(multiplier) {
  speedMultiplier = multiplier;
}

// 泡を150個作成
for (let i = 0; i < 150; i++) {
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
    opacity: 0.3,
    transparent: true,
    roughness: 1,
    metalness: 0.2,
  });

  const bubble = new THREE.Mesh(geometry, material);

  bubble.position.set(
    Math.random() * 6 - 3,
    Math.random() * 6 - 3,
    Math.random() * 6 - 3
  );

  scene.add(bubble);
  bubbles.push({
    bubble: bubble,
    directionX: (Math.random() - 0.5) * 0.01,
    directionY: (Math.random() - 0.5) * 0.01,
    directionZ: (Math.random() - 0.5) * 0.01,
  });
}

// 照明を追加
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

scene.background = new THREE.Color(0xffffff);
camera.position.z = 5;

// 初期状態で泡を粒子化
bubbles.forEach(bubbleData => {
  const bubble = bubbleData.bubble;
  bubble.scale.set(0.01, 0.01, 0.01);
  bubble.material.opacity = 0;
});

// アニメーション関数
function animate() {
  requestAnimationFrame(animate);

  const aspectRatio = window.innerWidth / window.innerHeight;
  const cameraHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const cameraWidth = cameraHeight * aspectRatio;

  bubbles.forEach(bubbleData => {
    const bubble = bubbleData.bubble;

    bubble.position.x += bubbleData.directionX * speedMultiplier;
    bubble.position.y += bubbleData.directionY * speedMultiplier;
    bubble.position.z += bubbleData.directionZ * speedMultiplier;

    if (bubble.position.x > cameraWidth / 2 || bubble.position.x < -cameraWidth / 2) bubbleData.directionX = -bubbleData.directionX;
    if (bubble.position.y > cameraHeight / 2 || bubble.position.y < -cameraHeight / 2) bubbleData.directionY = -bubbleData.directionY;
    if (bubble.position.z > 4 || bubble.position.z < -4) bubbleData.directionZ = -bubbleData.directionZ;

    bubble.rotation.x += 0.01 * speedMultiplier;
    bubble.rotation.y += 0.01 * speedMultiplier;
  });

  renderer.render(scene, camera);
}

// 背景のセットアップが完了したことを通知
loadingManager.modelLoaded();

// すべてのモデルが読み込まれたら、泡のアニメーションを開始
window.addEventListener('allModelsLoaded', () => {
  // 2.5秒後に泡を元に戻すアニメーション
  setTimeout(() => {
    bubbles.forEach(bubbleData => {
      const bubble = bubbleData.bubble;

      const targetScale = 1;
      const targetOpacity = 0.3;
      const duration = 5000;
      const startTime = performance.now();

      function animateBubble(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentScale = 0.01 + (targetScale - 0.01) * progress;
        const currentOpacity = 0 + (targetOpacity - 0) * progress;

        bubble.scale.set(currentScale, currentScale, currentScale);
        bubble.material.opacity = currentOpacity;

        if (progress < 1) {
          requestAnimationFrame(animateBubble);
        }
      }

      requestAnimationFrame(animateBubble);
    });
  }, 2000);

  // メインのアニメーションを開始
  animate();
});

// ウィンドウリサイズ対応
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, 200);
});