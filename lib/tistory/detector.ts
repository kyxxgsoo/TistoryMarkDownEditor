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
 * Tistory 에디터 DOM이 준비될 때까지 대기한다.
 * 최대 10초 대기 후 타임아웃.
 */
export function waitForEditor(): Promise<TistoryEditorElements> {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우 즉시 반환
    const existing = findElements();
    if (existing) {
      resolve(existing);
      return;
    }

    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error('[TistoryMarkdownEditor] 에디터 DOM을 찾을 수 없습니다. (10초 타임아웃)'));
    }, 10_000);

    const observer = new MutationObserver(() => {
      const elements = findElements();
      if (elements) {
        observer.disconnect();
        clearTimeout(timeout);
        resolve(elements);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
