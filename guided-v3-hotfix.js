(() => {
  'use strict';
  const seen = new WeakSet();

  function patchMapStep() {
    const app = document.getElementById('app');
    if (!app) return;

    const coachCards = [...app.querySelectorAll('.cv3-bubble, .cv3-coach, section, div')];
    const target = coachCards.find(el => el.textContent && el.textContent.includes('你估今題至少要拆成幾個小任務？'));
    if (!target) return;

    const choices = app.querySelector('.cv3-choices');
    if (!choices) return;
    const buttons = [...choices.querySelectorAll('button[data-answer-key="map"]')];
    if (!buttons.length) return;

    // V3 generates [n-2, n, n+2], so the middle option is the known number of source fact blocks.
    const correctButton = buttons[Math.floor(buttons.length / 2)];
    const n = correctButton ? correctButton.textContent.trim() : '';
    if (!n) return;

    // Persist the already-known structural fact so Continue works, without asking the learner to guess it.
    if (!buttons.some(b => b.classList.contains('picked')) && !seen.has(choices)) {
      seen.add(choices);
      correctButton.click();
      return;
    }

    const updatedApp = document.getElementById('app');
    if (!updatedApp) return;
    const updatedTarget = [...updatedApp.querySelectorAll('.cv3-bubble, .cv3-coach, section, div')]
      .find(el => el.textContent && el.textContent.includes('你估今題至少要拆成幾個小任務？'));
    const updatedChoices = updatedApp.querySelector('.cv3-choices');
    if (!updatedTarget || !updatedChoices) return;

    // Replace the meta-quiz with direct teaching.
    const title = [...updatedTarget.querySelectorAll('p,strong')].find(el => el.textContent.includes('你估今題至少要拆成幾個小任務？'));
    if (title) {
      const p = title.closest('p') || title;
      p.innerHTML = `<strong>呢一步唔需要你估。</strong> 教材已經將今題切成 <strong>${n}</strong> 個事實段落，我直接幫你建立地圖。`;
    }

    const intro = [...updatedTarget.querySelectorAll('p')].find(el => el.textContent.includes('你見到一條大問題'));
    if (intro) {
      intro.textContent = `長題第一步唔係答，而係先知道自己要逐段處理。今題共有 ${n} 個小任務；我哋會一次只處理一段。`;
    }

    updatedChoices.style.display = 'none';
    const feedback = updatedApp.querySelector('.cv3-feedback');
    if (feedback) {
      feedback.className = 'cv3-feedback good';
      feedback.innerHTML = `地圖已建立：<strong>${n}</strong> 個小任務。你唔需要估數目；下一步先開始學點讀第一段事實。`;
    }

    const progress = updatedApp.querySelector('.cv3-progress b, .gv-progress b');
    if (progress && progress.textContent.includes('先拆成幾個小任務')) {
      progress.textContent = progress.textContent.replace('先拆成幾個小任務', '建立案件地圖');
    }
  }

  const observer = new MutationObserver(() => queueMicrotask(patchMapStep));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  patchMapStep();
})();
