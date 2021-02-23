import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin } from 'prosemirror-state';
import ReactDOM from 'react-dom';
import { EditorPluginStates, EditorContextType } from './types';
import MenuBar from './menu-bar';
import { initProseMirrorEditorView } from './prosemirror';
import { EditorContext } from './context';
import './index.css';

const DOCUMENT_KEY = 'editor--academy__document';

const EditorReactMountComponent = ({
  editorDOMTargetRef,
}: {
  editorDOMTargetRef: React.RefObject<HTMLDivElement>;
}) => {
  const editorViewRef = useRef<EditorView | null>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const [editorState, updateEditorState] = useState<EditorState>();
  const [savedDocumentJSON, setSavedDocumentJSON] = useState<Record<
    string,
    any
  > | null>(null);

  useLayoutEffect(() => {
    const x = localStorage.getItem(DOCUMENT_KEY);
    if (!x) {
      return;
    }

    let documentJSON: Record<string, any> | null = null;

    try {
      documentJSON = JSON.parse(x);
    } catch (err) {
      console.error('loading document from localstorage', err);
    }

    setSavedDocumentJSON(documentJSON);
  }, []);

  useEffect(() => {
    if (!editorDOMTargetRef || !editorDOMTargetRef.current) {
      return () => {};
    }

    const target = editorDOMTargetRef.current;

    editorViewRef.current = initProseMirrorEditorView(target, {
      defaultDocument: savedDocumentJSON,
      updateEditorState,
    });
    setEditorView(editorViewRef.current);

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, [editorDOMTargetRef, savedDocumentJSON]);

  const saveContent = useCallback(() => {
    if (!editorView) {
      return;
    }

    const {
      state: { doc },
    } = editorView;

    const documentJSON = doc.toJSON();
    localStorage.setItem(DOCUMENT_KEY, JSON.stringify(documentJSON));
  }, [editorView]);

  if (!editorView || !editorState) {
    return null;
  }

  return (
    <EditorContext.Provider
      value={{
        editorState,
        dispatch: editorView.dispatch,
      }}
    >
      <MenuBar onPublish={saveContent} />
    </EditorContext.Provider>
  );
};

/*
 * The app starts here, but you won't need to touch on this part of the code
 * because of the integration between React and ProseMirror will happen on EditorReactMountComponent.
 */
const App = () => {
  /*
   * The [EditorView](https://prosemirror.net/docs/ref/#view.EditorView.constructor) needs a domNode to mounting
   * EditorView needs a DOM node to append into it.  Usually, we use a `div` but can be any DOM node.
   *
   * The "prosemirror-view" will take care of mounting,
   * update and manager this node and all its children.
   *
   * Please do not add anything inside of it because
   * React will try to control the re-render,
   * then you can end up in an infinite loop of renders.
   *
   * To make our lives easier,
   * we are using some default CSS coming from Prosemirror code.
   * You can check that on `public/index.html` and `index.css`,
   * to make this work, we need to have the `id="editor"` on the div.
   */
  const editorRef = useRef<HTMLDivElement>(document.createElement('div'));

  return (
    <>
      <EditorReactMountComponent editorDOMTargetRef={editorRef} />
      <div id="editor" ref={editorRef} />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
