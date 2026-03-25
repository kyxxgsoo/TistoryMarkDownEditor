import './style.css';

const STORAGE_KEY = 'tition-enabled';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="header">
    <div>
      <h1>Tition</h1>
      <div class="subtitle">Tistory In Notion</div>
    </div>
  </div>
  <div class="toggle-row">
    <div>
      <div class="toggle-label">에디터 활성화</div>
      <div class="toggle-status" id="status-text">불러오는 중...</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="toggle" />
      <span class="slider"></span>
    </label>
  </div>
`;

const toggle = document.getElementById('toggle') as HTMLInputElement;
const statusText = document.getElementById('status-text')!;

function updateStatus(enabled: boolean) {
  statusText.textContent = enabled ? '노션 스타일 에디터 사용 중' : '기본 에디터 사용 중';
}

// 초기 상태 로드
browser.storage.local.get(STORAGE_KEY).then((result) => {
  const enabled = result[STORAGE_KEY] !== false; // 기본값: true
  toggle.checked = enabled;
  updateStatus(enabled);
});

// 토글 이벤트
toggle.addEventListener('change', async () => {
  const enabled = toggle.checked;
  await browser.storage.local.set({ [STORAGE_KEY]: enabled });
  updateStatus(enabled);
});
