import React, { useCallback, useContext } from 'react';
import { EditorView } from 'prosemirror-view';
import Button from '@atlaskit/button/standard-button';
import BoldIcon from '@atlaskit/icon/glyph/editor/bold';
import ItalicIcon from '@atlaskit/icon/glyph/editor/italic';
import EditorTableIcon from '@atlaskit/icon/glyph/editor/table';
import {
  toggleStrongMark,
  toggleItalicMark,
  createHeading,
  createTable,
} from '../prosemirror/commands';
import { EditorState } from 'prosemirror-state';
import { EditorDispatch, EditorContextType } from '../types';

type ButtonElement = React.ComponentType<{
  editorState: EditorState;
  dispatch: EditorDispatch;
}>;

const ToggleBoldButton: ButtonElement = ({ editorState, dispatch }) => {
  const onClick = useCallback(() => {
    toggleStrongMark()(editorState, dispatch);
  }, [editorState, dispatch]);

  const { strongActive = false, strongDisabled = false } = {};

  return (
    <Button
      appearance="subtle"
      isDisabled={strongDisabled}
      onClick={onClick}
      spacing="none"
      css=""
    >
      <BoldIcon label="bold" size="large" />
    </Button>
  );
};

const ToggleItalicButton: ButtonElement = ({ editorState, dispatch }) => {
  const onClick = useCallback(() => {
    toggleItalicMark()(editorState, dispatch);
  }, [editorState, dispatch]);

  return (
    <Button appearance="subtle" onClick={onClick} spacing="none" css="">
      <ItalicIcon label="italic" size="large" />
    </Button>
  );
};

const HeadingButton: ButtonElement = ({ editorState, dispatch }) => {
  const onClick = useCallback(() => {
    createHeading(1)(editorState, dispatch);
  }, [editorState, dispatch]);

  return (
    <Button
      appearance="subtle"
      onClick={onClick}
      style={{ fontWeight: 'bold' }}
      css=""
    >
      Heading
    </Button>
  );
};

const TableButton: ButtonElement = ({ editorState, dispatch }) => {
  const onClick = useCallback(() => {
    createTable(editorState, dispatch);
  }, [editorState, dispatch]);

  return (
    <Button
      appearance="subtle"
      onClick={onClick}
      style={{ fontWeight: 'bold' }}
      css=""
    >
      <EditorTableIcon label="table" size="large" />
    </Button>
  );
};

const FormattingButtons: ButtonElement = ({ editorState, dispatch }) => {
  return (
    <section className="menu-bar__formatting">
      <ToggleBoldButton editorState={editorState} dispatch={dispatch} />
      <ToggleItalicButton editorState={editorState} dispatch={dispatch} />
      <div className="menur-bar__formatting-separator" />
      <HeadingButton editorState={editorState} dispatch={dispatch} />
      <TableButton editorState={editorState} dispatch={dispatch} />
    </section>
  );
};

export { ToggleBoldButton, ToggleItalicButton, FormattingButtons };
