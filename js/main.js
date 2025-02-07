{
  let currentSectionIndex = 0;
  const sections = document.querySelectorAll('.js-section');

  // sectionを切り替える関数
  function switchSection(index) {
    if (index < 0 || index >= sections.length) return;

    sections[currentSectionIndex].classList.remove('is-show');
    currentSectionIndex = index;
    sections[currentSectionIndex].classList.add('is-show');

    // sectionが変わると泡の速度を20倍に。background-three.js内のchangeBubblesSpeed関数を呼び出す
    changeBubblesSpeed(20);
    
    // 1秒後に元の速度に戻す
    setTimeout(() => {
      changeBubblesSpeed(1);
    }, 1000);
  }

  let wheelCount = 0;
  const wheelThreshold = 5; // 次のページに移動するために必要なホイール回転回数

  // マウスホイールイベント
  window.addEventListener('wheel', (event) => {
    // ホイールが下に回転した場合
    if (event.deltaY > 0) {
      wheelCount++;
      
      if (wheelCount >= wheelThreshold) {
        switchSection(currentSectionIndex + 1);
        wheelCount = 0;
      }
    // ホイールが上に回転した場合
    } else if (event.deltaY < 0) {
      wheelCount++;
      
      if (wheelCount >= wheelThreshold) {
        switchSection(currentSectionIndex - 1);
        wheelCount = 0;
      }
    }
  });

  // キーボード操作 (上下キー)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      switchSection(currentSectionIndex + 1);
    } else if (e.key === 'ArrowUp') {
      switchSection(currentSectionIndex - 1);
    }
  });
}


{
  const hamburger = document.getElementById('header__hamburger');
  const menu = document.getElementById('header__menu');
  const menuList = document.querySelector('.header__menu-list');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('is-active');
    menu.classList.toggle('is-active');

    if (menu.classList.contains('is-active')) {
      menuList.classList.add('is-active');
    } else {
      menuList.classList.remove('is-active');
    }
  });
}