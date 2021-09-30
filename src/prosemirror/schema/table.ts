import { DOMOutputSpec, Node as PMNode } from 'prosemirror-model';

// CSS-Grid implementation of table
export const table = {
  group: 'specialBlock',
  attrs: { columns: { default: 3 } },
  content: 'tableCell+',
  toDOM(node: PMNode): DOMOutputSpec {
    const style = ` 
    --table-column-size: ${node.attrs.columns};
      `;
    const attrs = { 'data-layout': 'true', style, class: 'table__node' };
    return ['article', attrs, 0];
  },
};

export const tableCell = {
  group: 'tableCell',
  content: 'textBlock+',
  isolating: true,
  toDOM(): DOMOutputSpec {
    const attrs = {
      'data-layout-section': 'true',
      class: 'table-cell__node',
    };
    return ['section', attrs, 0];
  },
};
