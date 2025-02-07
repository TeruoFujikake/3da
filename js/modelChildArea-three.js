import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { loadingManager } from './loadingManager.js';

// シーン作成
const scene = new THREE.Scene();

// オブジェクトエリアの要素を取得
const modelArea = document.getElementById('modelChildArea');
const modelAreaWidth = modelArea.clientWidth;
const modelAreaHeight = modelArea.clientHeight;

// カメラ設定
const camera = new THREE.PerspectiveCamera(75, modelAreaWidth / modelAreaHeight, 0.1, 1000);
camera.position.set(0, 1, 3); // 位置を調整

// レンダラー設定
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});
renderer.setSize(modelAreaWidth, modelAreaHeight);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
modelArea.appendChild(renderer.domElement);

// 環境マップの作成
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const neutralEnvironment = pmremGenerator.fromScene(new THREE.Scene());
scene.environment = neutralEnvironment.texture;

// ライティング設定
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// FBXモデルのロード
const loader = new FBXLoader();
let mixer; // アニメーションミキサー
const clock = new THREE.Clock(); // 時間管理用

loader.load(
    'model/Cards.fbx',
    function (object) {
        // モデルのスケールと位置を調整
        object.scale.set(0.02, 0.02, 0.02);
        object.position.set(0, -0.5, 0);
        
        // アニメーションの設定
        mixer = new THREE.AnimationMixer(object);
        if (object.animations.length > 0) {
            const action = mixer.clipAction(object.animations[0]); // 最初のアニメーションを取得
            action.play(); // アニメーションを再生
        }

        // マテリアルの設定
        object.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 0.3;
                child.material.roughness = 0.7;
                child.material.envMapIntensity = 1.0;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);
        loadingManager.modelLoaded();
    },
    // 読み込み進捗 ここは不要
    function (xhr) {
        const progress = Math.floor((xhr.loaded / xhr.total) * 100);
    },
    // エラーハンドリング
    function (error) {
        loadingManager.handleError(error);
    }
);

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

// すべてのモデルが読み込まれてからアニメーションを開始
window.addEventListener('allModelsLoaded', () => {
    animate();
});

// ウィンドウリサイズ対応
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    const newWidth = modelArea.clientWidth;
    const newHeight = modelArea.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}
