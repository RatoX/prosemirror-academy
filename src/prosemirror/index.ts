import { Node as PMNode } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { createPluginList } from './plugins';
import { schema } from './schema';

/**
 * The plugin list needs to be defined before we mount the EditorView.
 * Sometimes you will need to know the schema to set up the plugin correctly.
 */
const plugins = createPluginList({
  schema,
});

type Options = {
  defaultDocument: Record<string, any> | null;
};

const placeholderDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'Your awesome content...',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'It is here',
        },
      ],
    },
    {
      type: 'layout',
      content: [
        {
          type: 'layoutSection',
          attrs: {
            area: 'side-one',
          },
          content: [
            {
              type: 'heading',
              attrs: {
                level: 1,
              },
              content: [
                {
                  type: 'text',
                  text: '01 - Side content',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Some content...',
                },
              ],
            },
          ],
        },
        {
          type: 'layoutSection',
          attrs: {
            area: 'middle-one',
          },
          content: [
            {
              type: 'heading',
              attrs: {
                level: 1,
              },
              content: [
                {
                  type: 'text',
                  text: '02 - Middle up content',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Some content...',
                },
              ],
            },
          ],
        },
        {
          type: 'layoutSection',
          attrs: {
            area: 'middle-two',
          },
          content: [
            {
              type: 'heading',
              attrs: {
                level: 1,
              },
              content: [
                {
                  type: 'text',
                  text: '03 - Middle down content',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Some content...',
                },
              ],
            },
          ],
        },
        {
          type: 'layoutSection',
          attrs: {
            area: 'side-two',
          },
          content: [
            {
              type: 'heading',
              attrs: {
                level: 1,
              },
              content: [
                {
                  type: 'text',
                  text: '04 - Side content',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Some content...',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'maybe...',
        },
      ],
    },
  ],
};

export const initProseMirrorEditorView = (
  target: HTMLDivElement,
  options: Options,
): EditorView => {
  const { defaultDocument } = options;
  /**
   * The EditorView needs two things to work properly:
   * - DOM Node:
   *  As explained before, the EditorView will manager this DOM for you.
   *
   * - An EditorState:
   *  The main thing about how ProseMirror works, there is an excellent guide about what is an (EditorState)[https://prosemirror.net/docs/guide/#state].
   *
   *
   * EditorView is mutable!
   * With this in mind, we will use its instance later,
   * whether to update the EditorState or to dispatch new transactions.
   */
  const editorView = new EditorView(target, {
    state: EditorState.create({
      plugins,
      schema,
      doc: PMNode.fromJSON(schema, defaultDocument || placeholderDocument),
    }),
    /**
     * We are overriding the native dispatch function
     * because we will sync the Prosemiror plugin states
     * with React state after every transaction.
     */
    dispatchTransaction(tr) {
      /**
       * This `apply` function is not the same as (Prototype Apply)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply] becareful.
       *
       * This line is getting the current EditorState and applying a transaction.
       * ProseMirror forces us to keep the immutable approach. Then this function will return a new state.
       */
      const newEditorState = editorView.state.apply(tr);

      /**
       * Using the new state, the EditorView needs to update the UI to represents the new state.
       */
      editorView.updateState(newEditorState);
    },
  });

  return editorView;
};
