import { NodeType, MarkType, Mark } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { Command } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { NodeSelection } from 'prosemirror-state';

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the selected textblocks to the
// given node type with the given attributes.
const setBlockTypeInSelection = (
  nodeType: NodeType,
  attrs: { [key: string]: any },
): Command => (state, dispatch) => {
  const { from, to } = state.selection;
  let applicable = false;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (applicable) {
      return false;
    }

    if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) {
      return;
    }

    if (node.type === nodeType) {
      applicable = true;
    } else {
      const $pos = state.doc.resolve(pos);
      const index = $pos.index();
      applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
    }
  });

  if (!applicable) {
    return false;
  }

  if (dispatch) {
    const { tr } = state;
    tr.setBlockType(from, to, nodeType, attrs);
    tr.scrollIntoView();

    dispatch(tr);
  }

  return true;
};

export const toggleStrongMark = (): Command => (state, dispatch) => {
  const {
    schema: {
      marks: { strong },
    },
  } = state;

  return toggleMark(strong)(state, dispatch);
};

export const createCodeBlock = (): Command => (state, dispatch) => {
  const {
    schema: {
      nodes: { code_block },
    },
  } = state;

  return setBlockTypeInSelection(code_block, {})(state, dispatch);
};

export const createFlowBlock = (): Command => (state, dispatch) => {
  const { tr, selection, schema } = state;
  if (dispatch) {
    dispatch(
      tr.insert(selection.from, schema.nodes.flowGraph.createChecked({})),
    );
    return true;
  }
  return false;
};

export const createHeading = (level: number): Command => (state, dispatch) => {
  const {
    schema: {
      nodes: { heading },
    },
  } = state;

  return setBlockTypeInSelection(heading, { level })(state, dispatch);
};

// https://stackoverflow.com/a/58110124
function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export const toggleTextAlignment = (
  alignment: 'left' | 'centre' | 'right',
): Command => (state, dispatch) => {
  const doc = state.doc;
  const selection = state.selection;
  const tr = state.tr; // only do this once at the beginning as accessing state.tr creates a new transaction

  const textAlignmentMarkType: MarkType = state.schema.marks.text_align;
  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      const marks = node.marks
        .map((mark: Mark) => {
          if (mark.type !== textAlignmentMarkType) {
            return mark;
          }
          return null;
        })
        .filter(nonNullable);

      if (alignment !== 'left') {
        marks.push(textAlignmentMarkType.create({ alignment }));
      }

      tr.setNodeMarkup(pos, undefined, undefined, marks);

      return false;
    }
  });

  // if there is no change in the transaction, it is the same as checking for a code block
  // because the document could not have been modified unless the selection is in a paragraph
  // or heading (that validation is already done in the nodesBetween callback above)
  // [note: it is an anti-pattern to return false after dispatch]
  if (!tr.docChanged) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

export const addFlowElement = (): Command => (state, dispatch) => {
  const doc = state.doc;
  const selection = state.selection;
  if (
    !(selection instanceof NodeSelection) ||
    selection.node.type.name !== 'flowGraph'
  ) {
    return false;
  }
  const tr = state.tr; // only do this once at the beginning as accessing state.tr creates a new transaction
  const {
    doc: {
      type: { schema },
    },
  } = state;
  const flowElement = schema.nodes.flowElement.createAndFill({
    id: uuidv4(),
    data: { label: 'New node' },
    position: { x: 0, y: 0 },
  });

  tr.insert(selection.from + 1, flowElement);

  if (!tr.docChanged) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};
