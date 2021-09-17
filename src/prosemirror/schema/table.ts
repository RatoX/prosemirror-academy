import { DOMOutputSpec, Node as PMNode } from 'prosemirror-model';

// CSS-Grid implementation of table
export const table = {
  group: 'specialBlock',
  attrs: { columns: { default: 3 } },
  content: 'tableCell+',
  toDOM(node: PMNode): DOMOutputSpec {
    const style = ` 
        display: grid;
        grid-template-columns: repeat(${node.attrs.columns}, 1fr);
        border-top: 1px solid black;
        border-right: 1px solid black;
        margin-top: 1em;
        margin-bottom: 1em;
      `;
    const attrs = { 'data-layout': 'true', style };
    return ['div', attrs, 0];
  },
};

export const tableCell = {
  group: 'tableCell',
  content: 'textBlock*',
  defining: true,
  isolating: true,
  toDOM(): DOMOutputSpec {
    const style = `
      border-left: 1px solid black;
      border-bottom: 1px solid black;
      padding: 8px 4px;
      `;
    const attrs = { 'data-layout-section': 'true', style };
    return ['span', attrs, 0];
  },
};
