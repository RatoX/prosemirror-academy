import React, { useCallback } from 'react';
import { EditorContextType } from '../types';
import { toggleMark } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';

type MenuBarProps = EditorContextType & {
  editorState: EditorState<any>;
};

const MenuBar = ({ editorState, editorDispatch }: MenuBarProps) => {
  const onClick = useCallback(() => {
    const {
      schema: {
        marks: { strong },
      },
    } = editorState;

    toggleMark(strong)(editorState, editorDispatch);
  }, [editorState, editorDispatch]);

  return (
    <div>
      <button onClick={onClick}>Make it bold</button>
    </div>
  );
};

export default MenuBar;
