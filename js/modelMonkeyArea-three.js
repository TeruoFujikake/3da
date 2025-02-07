import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// シーン作成
const scene = new THREE.Scene();

// オブジェクトエリアの要素を取得
const model3dArea = document.getElementById('modelMonkeyArea');
const model3dAreaWidth = model3dArea.clientWidth;
const model3dAreaHeight = model3dArea.clientHeight;

// カメラ設定
const camera = new THREE.PerspectiveCamera(75, model3dAreaWidth / model3dAreaHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// レンダラー設定
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true // 背景を透明に
});
renderer.setSize(model3dAreaWidth, model3dAreaHeight);
renderer.setClearColor(0x000000, 0); // 背景を完全に透明に
model3dArea.appendChild(renderer.domElement);

// ライティング設定
const ambientLight = new THREE.AmbientLight(0xffffff, 7);
scene.add(ambientLight);

// HDRI環境マップの設定（反射用）
const rgbeLoader = new RGBELoader();
rgbeLoader.load('model/monkey/texture/golden_bay_2k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture; // 環境マップを設定
    scene.background = null; // 背景は透明のまま
});

// モデルのロード
const loader = new GLTFLoader();
loader.load('model/monkey/scene.gltf', function (gltf) {
    const model = gltf.scene;

    // モデルのスケールと位置を調整
    model.scale.set(3, 3, 3);
    model.position.set(0, 0, 0);


    // マテリアルのMetalnessとRoughnessを設定（反射を強くする）
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.metalness = 1.0; // 完全な金属
            child.material.roughness = 0.1; // 反射をはっきり
            child.material.envMap = scene.environment; // 環境マップを適用
            child.material.needsUpdate = true; // 更新を適用
        }
    });

    scene.add(model);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);
        model.rotation.y += 0.005; // ゆっくりと回転
        renderer.render(scene, camera);
    }
    animate();
});

// ウィンドウリサイズ対応
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    const newWidth = model3dArea.clientWidth;
    const newHeight = model3dArea.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}
