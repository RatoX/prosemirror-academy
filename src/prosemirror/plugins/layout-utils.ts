import { Node as PMNode } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';

export type NodePositions = {
  wrappingPositions: {
    startPos: number;
    endPos: number;
  };
  innerPositions: {
    startPos: number;
    endPos: number;
  };
  node: PMNode;
};

export const findLayoutParent = (
  selection: Selection,
): NodePositions | null => {
  const $from = selection.$from;
  if ($from.depth < 3) {
    return null;
  }

  const grandParentDepth = $from.depth - 2;
  const grandParentNode = $from.node(grandParentDepth);
  const isInsideALayoutNumberSection =
    grandParentNode && grandParentNode.type.name === 'layout';

  if (!isInsideALayoutNumberSection) {
    return null;
  }

  const startPos = $from.before(grandParentDepth);
  const endPos = startPos + grandParentNode.nodeSize;
  const innerStartPosition = $from.start(grandParentDepth);
  const innerEndPosition = $from.end(grandParentDepth);

  return {
    wrappingPositions: {
      startPos,
      endPos,
    },
    innerPositions: {
      startPos: innerStartPosition,
      endPos: innerEndPosition,
    },
    node: grandParentNode,
  };
};

export const findLayoutNumberSectionParent = (
  selection: Selection,
): NodePositions | null => {
  const $from = selection.$from;
  if ($from.depth < 3) {
    return null;
  }

  const grandParentDepth = $from.depth - 1;
  const grandParentNode = $from.node(grandParentDepth);
  const isInsideALayoutNumberSection =
    grandParentNode && grandParentNode.type.name === 'layoutNumberSection';

  if (!isInsideALayoutNumberSection) {
    return null;
  }

  const startPos = $from.before(grandParentDepth);
  const endPos = startPos + grandParentNode.nodeSize;
  const innerStartPosition = $from.start(grandParentDepth);
  const innerEndPosition = $from.end(grandParentDepth);

  return {
    wrappingPositions: {
      startPos,
      endPos,
    },
    innerPositions: {
      startPos: innerStartPosition,
      endPos: innerEndPosition,
    },
    node: grandParentNode,
  };
};

export const isLayoutSection = (node: PMNode): boolean => {
  return node.type.name === 'layoutSection';
};

export const isLayoutNumberSection = (node: PMNode): boolean => {
  return node.type.name === 'layoutNumberSection';
};

export type TextPosition = {
  startPos: number;
  endPos: number;
};
export const findInvalidTextPositions = (
  node: PMNode,
  positionOffset: number,
): Array<TextPosition> => {
  const result: Array<TextPosition> = [];

  const findAllNonNumberRegex = /(\D+)/g;
  const {
    type: {
      schema: {
        marks: { weird: weirdMarkType },
      },
    },
  } = node;

  const callback = (childNode: PMNode, position: number) => {
    if (!childNode.isText || weirdMarkType.isInSet(childNode.marks)) {
      return false;
    }

    const textContent = childNode.text || '';
    const matches = [...textContent.matchAll(findAllNonNumberRegex)];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (!match || match.index === undefined) {
        continue;
      }

      const startPos = match.index + position;
      const endPos = startPos + match[0].length;

      result.push({
        startPos,
        endPos,
      });
    }
  };

  node.nodesBetween(0, node.content.size, callback, positionOffset);

  return result;
};
