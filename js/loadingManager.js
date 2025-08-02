// ローディング管理用のクラス
class LoadingManager {
	constructor() {
    this.totalModels = 2; // 読み込むモデルの総数（background + Cards.fbx）
    this.loadedModels = 0;
    this.loadingElement = document.getElementById("loading");
    this.loadingProgressElement = document.querySelector(".loading__progress");
    this.isInitialized = false;
    this.currentProgress = 0; // 現在の進捗
    this.targetProgress = 0; // 目標の進捗
  }

  // プログレスバーのアニメーション
  animateProgress() {
    if (this.currentProgress < this.targetProgress) {
      this.currentProgress++;
      this.loadingProgressElement.textContent = `${this.currentProgress}%`;
      requestAnimationFrame(() => this.animateProgress());
    }
  }

  // モデルの読み込み完了を記録
  modelLoaded() {
    this.loadedModels++;
    this.targetProgress = Math.floor(
      (this.loadedModels / this.totalModels) * 100
    );

    // プログレスバーのアニメーションを開始
    this.animateProgress();

    // すべてのモデルが読み込まれた場合
    if (this.loadedModels === this.totalModels) {
      // 完全に100%まで到達するのを待ってから画面を非表示
      const checkProgress = setInterval(() => {
        if (this.currentProgress >= 100) {
          clearInterval(checkProgress);
          this.hideLoadingScreen();
          // カスタムイベントをディスパッチ
          window.dispatchEvent(new CustomEvent("allModelsLoaded"));
        }
      }, 10);
    }
  }

  // ローディング画面を非表示
  hideLoadingScreen() {
    setTimeout(() => {
      this.loadingElement.style.opacity = "0";
      setTimeout(() => {
        this.loadingElement.style.display = "none";
      }, 500);
    }, 500);
  }

  // エラー処理
  handleError(error) {
    console.error("モデルの読み込みに失敗しました:", error);
    this.loadingElement.style.display = "none";
  }
}

// シングルトンインスタンスをエクスポート
export const loadingManager = new LoadingManager();
