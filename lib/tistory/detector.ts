/**
 * Tistory 에디터 DOM 요소를 감지하고 반환한다.
 * 에디터가 비동기로 로드될 수 있으므로 MutationObserver를 사용한다.
 */

export interface TistoryEditorElements {
  /** 기본모드 에디터 컨테이너 (#kakao-editor-container) */
  editorContainer: HTMLElement;
  /** TinyMCE iframe (#editor-tistory_ifr) */
  editorIframe: HTMLIFrameElement;
  /** 숨겨진 textarea - 발행 시 콘텐츠 저장용 (#editor-tistory) */
  hiddenTextarea: HTMLTextAreaElement;
  /** 제목 입력 (#post-title-inp) */
  titleInput: HTMLTextAreaElement;
  /** 에디터 영역의 부모 (.kakao-editor) */
  kakaoEditor: HTMLElement;
}

function findElements(): TistoryEditorElements | null {
  const editorContainer = document.getElementById('kakao-editor-container');
  const editorIframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
  const hiddenTextarea = document.getElementById('editor-tistory') as HTMLTextAreaElement | null;
  const titleInput = document.getElementById('post-title-inp') as HTMLTextAreaElement | null;
  const kakaoEditor = document.querySelector('.kakao-editor') as HTMLElement | null;

  if (editorContainer && editorIframe && hiddenTextarea && titleInput && kakaoEditor) {
    return { editorContainer, editorIframe, hiddenTextarea, titleInput, kakaoEditor };
  }
  return null;
}

/**
 * TinyMCE iframe이 완전히 로드될 때까지 대기한다.
 * iframe DOM이 존재해도 contentDocument가 준비되지 않은 경우가 있다.
 */
function waitForIframeReady(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    try {
      const doc = iframe.contentDocument;
      if (doc?.readyState === 'complete' && doc.body) {
        resolve();
        return;
      }
    } catch {
      // cross-origin 접근 실패 시 load 이벤트로 폴백
    }

    iframe.addEventListener('load', () => resolve(), { once: true });

    // iframe이 이미 로드되었는데 이벤트를 놓친 경우를 위한 폴백
    setTimeout(() => resolve(), 2000);
  });
}

/**
 * Tistory 에디터 DOM이 준비될 때까지 대기한다.
 * 최대 10초 대기 후 타임아웃.
 * DOM 요소 발견 후 iframe 로드까지 대기하여 레이스 컨디션을 방지한다.
 */
export function waitForEditor(): Promise<TistoryEditorElements> {
  return new Promise((resolve, reject) => {
    let observer: MutationObserver | null = null;

    const timeout = setTimeout(() => {
      observer?.disconnect();
      reject(new Error('[Tition] 에디터 DOM을 찾을 수 없습니다. (10초 타임아웃)'));
    }, 10_000);

    async function onElementsFound(elements: TistoryEditorElements) {
      observer?.disconnect();
      clearTimeout(timeout);

      // iframe이 완전히 로드될 때까지 대기
      await waitForIframeReady(elements.editorIframe);

      resolve(elements);
    }

    // 이미 로드된 경우
    const existing = findElements();
    if (existing) {
      onElementsFound(existing);
      return;
    }

    observer = new MutationObserver(() => {
      const elements = findElements();
      if (elements) {
        onElementsFound(elements);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
