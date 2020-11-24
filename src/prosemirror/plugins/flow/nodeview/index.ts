import ReactDOM from 'react-dom';
import { Node as PMNode } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { renderFlow } from './render-flow';

type MutationSelection = {
  type: 'selection';
  target: Element;
};

type FlowViewProps = {
  node: PMNode;
  view: EditorView;
  getNodePosition: boolean | (() => number);
};
class FlowView implements NodeView {
  dom: HTMLElement;
  getPosition: () => number;
  view: EditorView;

  constructor({ view, node, getNodePosition }: FlowViewProps) {
    this.dom = document.createElement('figure');
    this.dom.classList.add('flow');
    this.view = view;

    const getPosition =
      getNodePosition instanceof Function ? getNodePosition : () => 0;
    this.getPosition = getPosition;
    renderFlow({ dom: this.dom, getPosition, node, view });
  }

  update(node: PMNode) {
    renderFlow({
      dom: this.dom,
      getPosition: this.getPosition,
      node,
      view: this.view,
    });
    return true;
  }

  stopEvent(event: Event) {
    return true;
  }

  ignoreMutation(mut: MutationRecord | MutationSelection) {
    return true;
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.dom);
  }
}

const view = (
  node: PMNode,
  view: EditorView,
  getPos: boolean | (() => number),
  decorations: Decoration[],
): NodeView => {
  return new FlowView({
    node,
    view,
    getNodePosition: getPos,
  });
};

export { view };
