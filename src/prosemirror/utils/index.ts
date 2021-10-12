import { Node as PMNode, NodeType } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
export { isMarkActive } from './marks';
export {
  printRowAndColSum,
  getRangeSum,
  mapStringToCoordinate,
  getAreaSum,
} from './table';

type NodeAndPosition = {
  startPos: number;
  endPos: number;
  node: PMNode;
  depth: number;
  innerEndPosition: number;
};

export const findParentNodeOfSelection = (
  selection: Selection,
  nodeType: NodeType,
): NodeAndPosition | undefined => {
  const { $from } = selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const parentNode = $from.node(depth);
    if (parentNode.type === nodeType) {
      const startPos = $from.before(depth);
      const endPos = startPos + parentNode.nodeSize;
      const innerEndPosition = $from.end(depth);
      return {
        node: parentNode,
        startPos,
        endPos,
        depth,
        innerEndPosition,
      };
    }
  }
};
