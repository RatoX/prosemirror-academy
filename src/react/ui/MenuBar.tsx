import React, { useCallback } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorContextType, TextFormattingPluginState } from '../../types';
import {
  toggleStrongMark,
  createCodeBlock,
  createHeading,
  toggleTextAlignment,
} from '../../prosemirror/commands';

type MenuBarProps = EditorContextType & {
  editorView: EditorView;
};

type MenuItem<T> = {
  editorView: EditorView;
  pluginState?: T;
};

const BoldMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleStrongMark()(state, dispatch);
  }, [state, dispatch]);

  const { strongActive = false, strongDisabled = true } = pluginState || {};

  return (
    <button
      disabled={strongDisabled}
      className={strongActive ? 'menu-item__active' : ''}
      onClick={onClick}
    >
      BOLD
    </button>
  );
};

const CodeBlockMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    createCodeBlock()(state, dispatch);
  }, [state, dispatch]);

  return <button onClick={onClick}>Code Block</button>;
};

const HeadingMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
  level,
}: MenuItem<TextFormattingPluginState> & { level: number }) => {
  const onClick = useCallback(() => {
    createHeading(level)(state, dispatch);
  }, [state, dispatch, level]);

  const { headingActive = null } = pluginState || {};

  return (
    <button
      className={headingActive === level ? 'menu-item__active' : ''}
      onClick={onClick}
    >
      H{level}
    </button>
  );
};

const TextAlignmentMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClickLeft = useCallback(() => {
    toggleTextAlignment('left')(state, dispatch);
  }, [state, dispatch]);
  const onClickCenter = useCallback(() => {
    toggleTextAlignment('center')(state, dispatch);
  }, [state, dispatch]);
  const onClickRight = useCallback(() => {
    toggleTextAlignment('right')(state, dispatch);
  }, [state, dispatch]);

  const { textAlignmentStatus } = pluginState || {};

  return (
    <>
      <button
        data-actived={textAlignmentStatus === 'left'}
        disabled={!textAlignmentStatus}
        onClick={onClickLeft}
      >
        LEFT
      </button>
      <button
        data-actived={textAlignmentStatus === 'left'}
        disabled={!textAlignmentStatus}
        onClick={onClickCenter}
      >
        CENTER
      </button>
      <button
        data-actived={textAlignmentStatus === 'left'}
        disabled={!textAlignmentStatus}
        onClick={onClickRight}
      >
        RIGHT
      </button>
    </>
  );
};

const MenuBar = ({ editorView, editorPluginStates }: MenuBarProps) => {
  const { textFormattingPluginState } = editorPluginStates;

  return (
    <div id="menu-bar">
      <BoldMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
      <CodeBlockMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />

      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={1}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={2}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={3}
      />

      <TextAlignmentMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
    </div>
  );
};

export default MenuBar;
