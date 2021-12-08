/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import TextSeeker from '../api/dom/TextSeeker';
import * as Spot from './Spot';

// Note: This is duplicated with the TextPattern plugins `TextSearch` module, as there isn't really a nice way to share code across
// plugins/themes. So if any changes are made here, be sure to keep changes synced with the textpattern plugin

export type ProcessCallback = (element: Text, offset: number, text: string) => number;

// This largely is derived from robins isBoundary check, however it also treats contenteditable=false elements as a boundary
// See robins `Structure.isEmptyTag` for the list of quasi block elements
const isBoundary = (dom: DOMUtils, node: Node) => dom.isBlock(node) || Arr.contains([ 'BR', 'IMG', 'HR', 'INPUT' ], node.nodeName) || dom.getContentEditable(node) === 'false';

const repeatLeft = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, (node) => isBoundary(dom, node));
  return Optional.from(search.backwards(node, offset, process, rootNode));
};

const repeatRight = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, (node) => isBoundary(dom, node));
  return Optional.from(search.forwards(node, offset, process, rootNode));
};

export {
  repeatLeft,
  repeatRight
};
