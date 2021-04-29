import { Plugin, PluginKey } from 'prosemirror-state';
import { toggleLayoutSection } from '../commands/layout';

export const createLayoutPlugin = (): Plugin => {
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        if (event.shiftKey && event.ctrlKey && event.key === 'T') {
          return toggleLayoutSection(view.state, view.dispatch);
        }

        return false;
      },
    },
  });
};
