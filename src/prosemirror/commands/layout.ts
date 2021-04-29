import { TextSelection } from 'prosemirror-state';
import { Command } from '../../types';
import {
  ResolvedPos,
  Node as PMNode,
  Schema,
  Fragment,
} from 'prosemirror-model';

const isLayoutSection = (node: PMNode | undefined | null): boolean =>
  Boolean(
    node && ['layoutSection', 'layoutNumberSection'].includes(node.type.name),
  );

export const toggleLayoutSection: Command = (state, dispatch) => {
  const { selection, doc, schema } = state;

  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;

  const parentNode = $from.node($from.depth - 1);

  if (!parentNode || !isLayoutSection(parentNode)) {
    return false;
  }

  const layoutSectionPosition = $from.before($from.depth - 1);
  if (layoutSectionPosition === null) {
    return false;
  }

  const nextLayoutSectionType =
    parentNode.type.name === 'layoutNumberSection'
      ? schema.nodes.layoutSection
      : schema.nodes.layoutNumberSection;

  const { tr } = state;

  tr.setNodeMarkup(
    layoutSectionPosition,
    nextLayoutSectionType,
    parentNode.attrs,
  );

  if (dispatch) {
    dispatch(tr);
  }

  return false;
};
