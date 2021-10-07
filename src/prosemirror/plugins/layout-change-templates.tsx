import React, { useEffect, useMemo, useCallback, useState } from 'react';
import SwitcherIcon from '@atlaskit/icon/glyph/switcher';
import Button from '@atlaskit/button/standard-button';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { ProgressTracker, Stages } from '@atlaskit/progress-tracker';

const defaultProgress: Stages = [
  {
    id: '1',
    label: 'First',
    percentageComplete: 0,
    status: 'unvisited',
  },
  {
    id: '2',
    label: 'Second',
    percentageComplete: 0,
    status: 'unvisited',
  },
  {
    id: '3',
    label: 'Thrid',
    percentageComplete: 0,
    status: 'unvisited',
  },
  {
    id: '4',
    label: 'Fourth',
    percentageComplete: 0,
    status: 'unvisited',
  },
  {
    id: '5',
    label: '',
    percentageComplete: 0,
    status: 'disabled',
  },
];

type AreasContent = {
  one?: number;
  two?: number;
  three?: number;
  four?: number;
};
type AreaNumbers = 'one' | 'two' | 'three' | 'four';
type AreaComponentProps = {
  area: AreaNumbers;
  setContentArea: (area: AreaNumbers) => void;
  deleteContentArea: (area: AreaNumbers) => void;
  areasContent: AreasContent;
};
const AreaComponent: React.FC<AreaComponentProps> = ({
  area,
  setContentArea,
  areasContent,
  deleteContentArea,
}) => {
  const currentIndex = Object.keys(areasContent).length;
  const areasContentValue = areasContent[area];
  const isDisabled = Boolean(
    areasContentValue !== undefined && areasContentValue < currentIndex - 1,
  );
  const isLastAdded = Boolean(
    areasContentValue !== undefined && areasContentValue === currentIndex - 1,
  );

  const onClick = useCallback(() => {
    if (isDisabled) {
      return;
    }

    if (isLastAdded) {
      deleteContentArea(area);
      return;
    }

    setContentArea(area);
  }, [setContentArea, area, isDisabled, isLastAdded, deleteContentArea]);
  const className = `template-layout-item template-layout-item__${area}`;
  const content =
    areasContentValue === undefined ? 'Empty' : areasContentValue + 1;

  return (
    <section
      className={className}
      onClick={onClick}
      aria-disabled={isDisabled}
      data-last-added={isLastAdded}
    >
      {content}
    </section>
  );
};

type AreaContentProgressProps = {
  areasContent: AreasContent;
  onProgress: () => void;
  onComplete: () => void;
};
const AreaContentProgress: React.FC<AreaContentProgressProps> = ({
  areasContent,
  onComplete,
  onProgress,
}) => {
  const progress = useMemo(() => {
    const currentIndex = Object.keys(areasContent).length;

    const result: Stages = [];
    for (let i = 0; i < defaultProgress.length; i++) {
      const isComplete = i <= currentIndex - 1;
      const isCurrent = i === currentIndex;

      result[i] = {
        ...defaultProgress[i],
        percentageComplete: isComplete ? 100 : 0,
        status: isCurrent ? 'current' : 'unvisited',
      };
    }

    const lastIndex = defaultProgress.length - 1;
    const isDone = currentIndex === lastIndex;

    if (isDone) {
      result[lastIndex] = {
        ...result[lastIndex],
        label: '✅ Done',
        status: 'visited',
      };
    } else {
      result[lastIndex] = {
        ...result[lastIndex],
        label: '',
      };
    }

    return result;
  }, [areasContent]);

  useEffect(() => {
    const currentIndex = Object.keys(areasContent).length;
    const lastIndex = defaultProgress.length - 1;
    const isDone = currentIndex === lastIndex;

    if (isDone) {
      onComplete();
    } else {
      onProgress();
    }
  }, [areasContent, onComplete, onProgress]);

  return <ProgressTracker items={progress} spacing="cosy" />;
};

type TemplateOptionsProps = {
  option: 'a' | 'b' | 'c';
  onTemplateOptionsOrderReady: (result: number[]) => void;
  onTemplateOptionsOrderProgress: () => void;
};
const TemplateOptions: React.FC<TemplateOptionsProps> = ({
  option,
  onTemplateOptionsOrderReady,
  onTemplateOptionsOrderProgress,
}) => {
  const className = `template-layout-option template-layout-option__${option}`;
  const [areasContent, setAreaContent] = useState<AreasContent>({});
  const setContentArea = useCallback(
    (area: AreaNumbers) => {
      const currentIndex = Object.keys(areasContent).length;
      setAreaContent({
        ...areasContent,
        [area]: currentIndex,
      });
    },
    [areasContent],
  );
  const deleteContentArea = useCallback(
    (area: AreaNumbers) => {
      const nextSectionContent = {
        ...areasContent,
      };

      delete nextSectionContent[area];

      setAreaContent(nextSectionContent);
    },
    [areasContent],
  );
  const onAreaSetComplete = useCallback(() => {
    const result: Array<number> = [
      areasContent.one,
      areasContent.two,
      areasContent.three,
      areasContent.four,
    ].filter((i): i is number => typeof i === 'number');

    if (result.length === 4) {
      onTemplateOptionsOrderReady(result);
    }
  }, [areasContent, onTemplateOptionsOrderReady]);

  const onAreaProgress = useCallback(() => {
    onTemplateOptionsOrderProgress();
  }, [onTemplateOptionsOrderProgress]);

  return (
    <section className="template-layout-progress">
      <AreaContentProgress
        areasContent={areasContent}
        onComplete={onAreaSetComplete}
        onProgress={onAreaProgress}
      />

      <article className={className}>
        <AreaComponent
          area="one"
          setContentArea={setContentArea}
          areasContent={areasContent}
          deleteContentArea={deleteContentArea}
        />
        <AreaComponent
          area="two"
          setContentArea={setContentArea}
          areasContent={areasContent}
          deleteContentArea={deleteContentArea}
        />
        <AreaComponent
          area="three"
          setContentArea={setContentArea}
          areasContent={areasContent}
          deleteContentArea={deleteContentArea}
        />
        <AreaComponent
          area="four"
          setContentArea={setContentArea}
          areasContent={areasContent}
          deleteContentArea={deleteContentArea}
        />
      </article>
    </section>
  );
};

const TAB_TEMPLATE_TYPES = ['type-a', 'type-b', 'type-c'];

type TemplateTabsProps = {
  onTemplateProgress: () => void;
  onTemplateReady: (props: NextTemplateType) => void;
};
const TemplateTabs: React.FC<TemplateTabsProps> = ({
  onTemplateReady,
  onTemplateProgress,
}) => {
  const [templateType, setTemplateType] = useState<string>('type-a');

  const onTabChange = useCallback((index: number) => {
    setTemplateType(TAB_TEMPLATE_TYPES[index]);
  }, []);
  const onTemplateOptionsOrderReady = useCallback(
    (sectionsOrder: number[]) => {
      if (!templateType) {
        return;
      }

      onTemplateReady({
        nextTemplate: templateType,
        sectionsOrder,
      });
    },
    [onTemplateReady, templateType],
  );
  return (
    <Tabs onChange={onTabChange} id="default">
      <TabList>
        <Tab>Type A</Tab>
        <Tab>Type B</Tab>
        <Tab>Type C</Tab>
      </TabList>
      <TabPanel>
        <TemplateOptions
          option="a"
          onTemplateOptionsOrderReady={onTemplateOptionsOrderReady}
          onTemplateOptionsOrderProgress={onTemplateProgress}
        />
      </TabPanel>
      <TabPanel>
        <TemplateOptions
          option="b"
          onTemplateOptionsOrderReady={onTemplateOptionsOrderReady}
          onTemplateOptionsOrderProgress={onTemplateProgress}
        />
      </TabPanel>
      <TabPanel>
        <TemplateOptions
          option="c"
          onTemplateOptionsOrderReady={onTemplateOptionsOrderReady}
          onTemplateOptionsOrderProgress={onTemplateProgress}
        />
      </TabPanel>
    </Tabs>
  );
};

export type NextTemplateType = {
  nextTemplate: string;
  sectionsOrder: number[];
};

type Props = {
  onApply: (props: NextTemplateType) => void;
  onRemove: () => void;
};
export const LayoutChangeTemplates: React.FC<Props> = ({
  onApply,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const [
    nextTemplateData,
    setNextTemplateData,
  ] = useState<NextTemplateType | null>(null);
  const onTemplateReady = useCallback(props => {
    setNextTemplateData(props);
  }, []);
  const onTemplateProgress = useCallback(() => {
    setNextTemplateData(null);
  }, []);

  const onTemplateApply = useCallback(() => {
    if (!nextTemplateData) {
      return;
    }

    onApply(nextTemplateData);
    closeModal();
  }, [onApply, nextTemplateData, closeModal]);
  const onTemplateRemove = useCallback(() => {
    onRemove();
    closeModal();
  }, [onRemove, closeModal]);
  const isReadyToApply = Boolean(nextTemplateData);

  return (
    <>
      <Button onClick={openModal} appearance="subtle" spacing="compact" css="">
        <SwitcherIcon label="change template" size="small" />
      </Button>
      <ModalTransition>
        {isOpen && (
          <Modal onClose={closeModal}>
            <ModalHeader>
              <ModalTitle>Change a new template for your layout</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <TemplateTabs
                onTemplateReady={onTemplateReady}
                onTemplateProgress={onTemplateProgress}
              />
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeModal} css="">
                Cancel
              </Button>
              <Button
                isDisabled={!isReadyToApply}
                appearance="primary"
                onClick={onTemplateApply}
                css=""
              >
                Apply
              </Button>
              <Button appearance="warning" css="" onClick={onTemplateRemove}>
                No Template
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
};
