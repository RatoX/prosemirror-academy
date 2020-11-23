import React, { useCallback } from 'react';
import { EditorView } from 'prosemirror-view';
import {
  EditorContextType,
  TextFormattingPluginState,
  TextAlignmentPluginState,
  FlowPluginState,
} from '../../types';
import {
  toggleStrongMark,
  createCodeBlock,
  createHeading,
  toggleTextAlignment,
  createFlowBlock,
  addFlowElement,
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

const FlowBlockMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<FlowPluginState>) => {
  const onClick = useCallback(() => {
    createFlowBlock()(state, dispatch);
  }, [state, dispatch]);

  return <button onClick={onClick}>Diagram</button>;
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

const TextAlignmentLeftMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextAlignmentPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('left')(state, dispatch);
  }, [state, dispatch]);

  const { alignmentDisabled = false } = pluginState || {};

  return (
    <button disabled={alignmentDisabled} onClick={onClick}>
      LEFT ALIGN
    </button>
  );
};

const TextAlignmentCentreMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextAlignmentPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('centre')(state, dispatch);
  }, [state, dispatch]);

  const { alignmentDisabled = false } = pluginState || {};

  return (
    <button disabled={alignmentDisabled} onClick={onClick}>
      CENTRE ALIGN
    </button>
  );
};

const TextAlignmentRightMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextAlignmentPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('right')(state, dispatch);
  }, [state, dispatch]);

  const { alignmentDisabled = false } = pluginState || {};

  return (
    <button disabled={alignmentDisabled} onClick={onClick}>
      RIGHT ALIGN
    </button>
  );
};

const FlowAddElementMenuItem = ({
  editorView: { state, dispatch },
}: MenuItem<unknown>) => {
  const onClick = useCallback(() => {
    addFlowElement()(state, dispatch);
  }, [state, dispatch]);

  return (
    <button disabled={false} onClick={onClick}>
      ADD ELEMENT
    </button>
  );
};

const MenuBar: React.FC<MenuBarProps> = ({
  editorView,
  editorPluginStates,
}) => {
  const {
    textFormattingPluginState,
    textAlignmentPluginState,
    flowPluginState,
  } = editorPluginStates;

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

      <FlowBlockMenuItem
        editorView={editorView}
        pluginState={flowPluginState}
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
      <TextAlignmentLeftMenuItem
        editorView={editorView}
        pluginState={textAlignmentPluginState}
      />
      <TextAlignmentCentreMenuItem
        editorView={editorView}
        pluginState={textAlignmentPluginState}
      />
      <TextAlignmentRightMenuItem
        editorView={editorView}
        pluginState={textAlignmentPluginState}
      />
      <FlowAddElementMenuItem editorView={editorView} />
    </div>
  );
};

export default MenuBar;
