// https://raw.githubusercontent.com/ProseMirror/prosemirror-schema-basic/master/src/schema-basic.js
import {
  Schema,
  NodeSpec,
  MarkSpec,
  DOMOutputSpec,
  Node as PMNode,
} from 'prosemirror-model';

import { table, tableCell } from './table';

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes: { [key: string]: NodeSpec } = {
  // :: NodeSpec The top level document node.
  doc: {
    content: '(textBlock | specialBlock)+',
  },

  // :: NodeSpec The text node.
  text: {
    group: 'inline',
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: 'inline*',
    group: 'textBlock',
    parseDOM: [{ tag: 'p' }],
    toDOM(): DOMOutputSpec {
      return ['p', 0];
    },
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    marks: 'em',
    group: 'textBlock',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
    ],
    toDOM(node: PMNode): DOMOutputSpec {
      return ['h' + node.attrs.level, 0];
    },
  },
  table,
  tableCell,
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
        getAttrs: (node: Node | string): false | null => {
          if (typeof node === 'string') {
            return null;
          }
          return (node as HTMLElement).style.fontWeight !== 'normal' && null;
        },
      },
      {
        style: 'font-weight',
        getAttrs: (value: Node | string): false | null => {
          if (typeof value === 'string') {
            return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
          }
          return null;
        },
      },
    ],
    toDOM(): DOMOutputSpec {
      return ['strong', 0];
    },
  },

  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM(): DOMOutputSpec {
      return ['em', 0];
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
