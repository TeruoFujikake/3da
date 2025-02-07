const mainVisualTextArea = document.getElementById('mainVisualTextArea');
const mainVisualText = document.querySelector('.mainVisualText__text');
const text = mainVisualText.textContent;

// テキストを空にする
mainVisualText.textContent = '';

// 一文字ずつ分割して、spanで囲む
const characters = text.split('');
characters.forEach((character, index) => {
  const span = document.createElement('span');
  span.textContent = character;
  span.style.opacity = '0';
  span.style.setProperty('--delay', `${index * 0.15}s`);
  mainVisualText.appendChild(span);
});

// ローディング完了後にアニメーション開始
window.addEventListener('allModelsLoaded', () => {
  // ローディング画面のフェードアウトを待ってからアニメーション開始
  setTimeout(() => {
    mainVisualTextArea.classList.add('is-active');
  }, 4000);

});
