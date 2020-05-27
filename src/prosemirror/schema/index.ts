// https://raw.githubusercontent.com/ProseMirror/prosemirror-schema-basic/master/src/schema-basic.js
//
import {
  Schema,
  NodeSpec,
  MarkSpec,
  Node as ProseMirrorNode,
} from 'prosemirror-model';

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes: { [key: string]: NodeSpec } = {
  // :: NodeSpec The top level document node.
  doc: {
    content: 'block+',
    marks: 'text_align',
  },

  // :: NodeSpec The text node.
  text: {
    group: 'inline',
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', 0];
    },
  },

  status: {
    inline: true,
    attrs: { anything: { default: 'TODO' } },
    group: 'inline',
    parseDOM: [
      {
        tag: 'mark',
        getAttrs: domNode => {
          if (domNode instanceof HTMLElement) {
            const anything = domNode.getAttribute('data-anything');

            return {
              anything,
            };
          }

          return false;
        },
      },
    ],
    toDOM(node) {
      const attrs = node.attrs;

      return [
        'mark',
        {
          'data-anything': attrs.anything,
        },
        ['strong', attrs.anything],
      ];
    },
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    marks: 'em',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
    ],
    toDOM(node: ProseMirrorNode) {
      return ['h' + node.attrs.level, 0];
    },
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM() {
      return ['pre', ['code', 0]];
    },
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return ['br'];
    },
  },
};

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks: { [key: string]: MarkSpec } = {
  strong: {
    parseDOM: [
      { tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: 'b',
        getAttrs: node => {
          if (typeof node === 'string') {
            return null;
          }
          return (node as HTMLElement).style.fontWeight !== 'normal' && null;
        },
      },
      {
        style: 'font-weight',
        getAttrs: value => {
          if (typeof value === 'string') {
            return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
          }
          return null;
        },
      },
    ],
    toDOM() {
      return ['strong', 0];
    },
  },

  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM() {
      return ['em', 0];
    },
  },

  text_align: {
    attrs: {
      alignment: {
        default: null,
      },
    },
    parseDOM: [{ tag: 'div.text-align' }],
    toDOM(mark) {
      const alignment = mark.attrs.alignment;
      return ['div', { class: `text-align text-align__${alignment}` }, 0];
    },
  },
};

// :: Schema
// This schema roughly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
export const schema = new Schema({ nodes, marks });
