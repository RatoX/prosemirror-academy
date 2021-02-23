import { createContext } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorContextType } from './types';
import MenuBar from './menu-bar';
import { initProseMirrorEditorView } from './prosemirror';

const EditorContext = createContext<EditorContextType>({
  editorState: null,
  dispatch: () => {},
});

export { EditorContext };
