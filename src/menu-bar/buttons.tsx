import React, { useCallback, useContext } from 'react';
import { EditorView } from 'prosemirror-view';
import Button from '@atlaskit/button/standard-button';
import BoldIcon from '@atlaskit/icon/glyph/editor/bold';
import ItalicIcon from '@atlaskit/icon/glyph/editor/italic';
import {
  toggleStrongMark,
  toggleItalicMark,
  createHeading,
} from '../prosemirror/commands';

type ButtonElement = React.ComponentType<{ editorView: EditorView }>;

const ToggleBoldButton: ButtonElement = ({ editorView }) => {
  const onClick = useCallback(() => {
    toggleStrongMark()(editorView.state, editorView.dispatch);
  }, [editorView.state, editorView.dispatch]);

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

const ToggleItalicButton: ButtonElement = ({ editorView }) => {
  const onClick = useCallback(() => {
    toggleItalicMark()(editorView.state, editorView.dispatch);
  }, [editorView.state, editorView.dispatch]);

  return (
    <Button appearance="subtle" onClick={onClick} spacing="none" css="">
      <ItalicIcon label="italic" size="large" />
    </Button>
  );
};

const HeadingButton: ButtonElement = ({ editorView }) => {
  const onClick = useCallback(() => {
    createHeading(1)(editorView.state, editorView.dispatch);
  }, [editorView.state, editorView.dispatch]);

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

const FormattingButtons: ButtonElement = ({ editorView }) => {
  return (
    <section className="menu-bar__formatting">
      <ToggleBoldButton editorView={editorView} />
      <ToggleItalicButton editorView={editorView} />
      <div className="menur-bar__formatting-separator" />
      <HeadingButton editorView={editorView} />
    </section>
  );
};

export { ToggleBoldButton, ToggleItalicButton, FormattingButtons };
