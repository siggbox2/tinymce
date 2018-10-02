import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  Button as AlloyButton,
  SketchSpec,
  Tabstopping,
} from '@ephox/alloy';
import { Merger, Option } from '@ephox/katamari';
import { formActionEvent, formCancelEvent, formSubmitEvent } from 'tinymce/themes/silver/ui/general/FormEvents';
import { IconProvider } from '../icons/Icons';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { renderIconFromPack } from '../button/ButtonSlices';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

export interface ButtonFoo {
  name: string;
  text: string;
  disabled?: boolean;
  primary: boolean;
}

export interface IconButtonFoo {
  name: string;
  icon: Option<string>;
  tooltip: Option<string>;
  disabled?: boolean;
}

const renderCommon = (spec, action, extraBehaviours = [], dom, components): SketchSpec => {
  const common = {
    buttonBehaviours: Behaviour.derive([
      DisablingConfigs.button(spec.disabled),
      Tabstopping.config({}),
      AddEventsBehaviour.config('button press', [
        AlloyEvents.preventDefault('click'),
        AlloyEvents.preventDefault('mousedown')
      ])
    ].concat(extraBehaviours)),
    eventOrder: {
      click: ['button press', 'alloy.base.behaviour'],
      mousedown: ['button press', 'alloy.base.behaviour']
    },
    action
  };
  const domFinal = Merger.deepMerge(common, { dom });
  const specFinal = Merger.deepMerge(domFinal, { components });
  return AlloyButton.sketch(specFinal);
};

export const renderIconButton = (spec: IconButtonFoo, action, icons: IconProvider, extraBehaviours = []): SketchSpec => {
  const tooltipAttributes = spec.tooltip.map<{}>((tooltip) => ({
    'aria-label': tooltip,
    'title': tooltip
  })).getOr({});
  const dom = {
    tag: 'button',
    classes: [ ToolbarButtonClasses.Button ],
    attributes: tooltipAttributes
  };
  const icon = spec.icon.map((iconName) => renderIconFromPack(iconName, icons));
  const components = componentRenderPipeline([
    icon
  ]);
  return renderCommon(spec, action, extraBehaviours, dom, components);
};

// Maybe the list of extraBehaviours is better than doing a Merger.deepMerge that
// we do elsewhere? Not sure.
export const renderButton = (spec: ButtonFoo, action, extraBehaviours = []): SketchSpec => {
  const dom = {
    tag: 'button',
    classes: spec.primary ? ['tox-button'] : ['tox-button', 'tox-button--secondary'],
    innerHtml: spec.text
  };
  const components = [];
  return renderCommon(spec, action, extraBehaviours, dom, components);
};

const getAction = (name: string, buttonType) => {
  return (comp) => {
    if (buttonType === 'custom') {
      AlloyTriggers.emitWith(comp, formActionEvent, {
        name,
        value: { }
      });
    } else if (buttonType === 'submit') {
      AlloyTriggers.emit(comp, formSubmitEvent);
    } else if (buttonType === 'cancel') {
      AlloyTriggers.emit(comp, formCancelEvent);
    } else {
      console.error('Unknown button type: ', buttonType);
    }
  };
};

export const renderFooterButton = (spec: ButtonFoo, buttonType: string): SketchSpec => {
  const action = getAction(spec.name, buttonType);
  return renderButton(spec, action, [ ]);
};

export const renderDialogButton = (spec: ButtonFoo): SketchSpec => {
  const action = getAction(spec.name, 'custom');
  return renderButton(spec, action, [
    RepresentingConfigs.memory(''),
    ComposingConfigs.self()
  ]);
};