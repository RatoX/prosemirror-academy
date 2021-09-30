import { Node as PMNode, NodeType } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
export { isMarkActive } from './marks';
export { printRowAndColSum } from './table';

type Props = {
  node: PMNode;
  startPos: number;
  endPos: number;
  depth: number;
};

export const findParentNodeOfSelection = (
  selection: Selection,
  nodeType: NodeType,
): Props | undefined => {
  const { $from } = selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const parentNode = $from.node(depth);
    if (parentNode.type === nodeType) {
      const startPos = $from.before(depth);
      const endPos = startPos + parentNode.nodeSize;
      return {
        node: parentNode,
        startPos,
        endPos,
        depth,
      };
    }
  }
};
