import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';
import { EditorPluginListOptions, KeymapPluginType } from '../../types';
import { Schema } from 'prosemirror-model';
import { buildInputRules } from './input-rules';
import { Plugin } from 'prosemirror-state';
import { createTextFormattingPlugin } from './text-formatting';
import { createTextAlignmentPlugin } from './text-alignment';
import { createFlowPlugin } from './flow';

const buildKeymap = (schema: Schema): KeymapPluginType => {
  return {
    'Mod-b': toggleMark(schema.marks.strong),
  };
};

/**
 * We can say that: The schema defines how to build a new node,
 * and the plugins show how to update it.
 */
export const createPluginList = (
  options: EditorPluginListOptions,
): Array<Plugin> => {
  /**
   * Each time that we call: `editorState.apply(transaction)`
   * Prosemirror will pass down the transaction for each `apply` plugin function,
   * following the order that we defined on the array.
   *
   * The same is true of handling events.
   * Handler functions, like `handleKeyDown`, will be called one at a time until one of them returns `true`.
   *
   * That is why the order is essential. By default, we always try to add input rules, keymap, external plugins before our plugins.
   */
  const plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema)),
    keymap(baseKeymap),
    gapCursor(),

    /**
     * This is the most fundamental plugin that
     * we have right now if you want to understand how it is working, we suggest you start with this one.
     *
     * If you want to understand what a plugin is, (check this file)[src/prosemirror/plugins/README.md]
     */
    createTextFormattingPlugin(),
    createTextAlignmentPlugin(),

    createFlowPlugin(),
  ];

  return plugins;
};

export { buildEditorPluginStates } from './build-plugin-states';
