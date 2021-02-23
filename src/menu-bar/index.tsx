import React, { useContext } from 'react';
import { EditorView } from 'prosemirror-view';
import { B200, B400 } from '@atlaskit/theme/colors';
import { AtlassianIcon } from '@atlaskit/logo';
import Button from '@atlaskit/button/standard-button';
import { FormattingButtons } from './buttons';
import { EditorContext } from '../context';

type MenuBarProps = {
  onPublish: () => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ onPublish }) => {
  const { editorState, dispatch } = useContext(EditorContext);
  if (!editorState) {
    return null;
  }

  return (
    <div id="menu-bar">
      <AtlassianIcon
        size="xlarge"
        iconColor={B200}
        iconGradientStart={B400}
        iconGradientStop={B200}
      />
      <FormattingButtons editorState={editorState} dispatch={dispatch} />
      <section className="menu-bar__action">
        <Button appearance="primary" onClick={onPublish} css="">
          Publish
        </Button>
      </section>
    </div>
  );
};

export default MenuBar;
