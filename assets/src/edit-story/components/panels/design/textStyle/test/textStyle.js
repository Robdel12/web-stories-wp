/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { act, fireEvent, screen } from '@testing-library/react';
import { createSolid } from '@web-stories-wp/patterns';
/**
 * Internal dependencies
 */
import TextStyle from '../textStyle';
import FontContext from '../../../../../app/font/context';
import RichTextContext from '../../../../richText/context';
import { calculateTextHeight } from '../../../../../utils/textMeasurements';
import calcRotatedResizeOffset from '../../../../../utils/calcRotatedResizeOffset';
import AdvancedDropDown from '../../../../form/advancedDropDown';
import ColorInput from '../../../../form/color/color';
import CanvasContext from '../../../../../app/canvas/context';
import {
  MULTIPLE_VALUE,
  MULTIPLE_DISPLAY_VALUE,
} from '../../../../../constants';
import { renderPanel } from '../../../shared/test/_utils';

jest.mock('../../../../../utils/textMeasurements');
jest.mock('../../../../form/advancedDropDown', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../../form/color/color', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const DEFAULT_PADDING = {
  horizontal: 0,
  vertical: 0,
  locked: true,
  hasHiddenPadding: false,
};

function Wrapper({ children }) {
  return (
    <CanvasContext.Provider
      value={{
        state: {},
        actions: {
          clearEditing: jest.fn(),
        },
      }}
    >
      <FontContext.Provider
        value={{
          state: {
            fonts: [
              {
                name: 'ABeeZee',
                value: 'ABeeZee',
                service: 'foo.bar.baz',
                weights: [400],
                styles: ['italic', 'regular'],
                variants: [
                  [0, 400],
                  [1, 400],
                ],
                fallbacks: ['serif'],
              },
              {
                name: 'Neu Font',
                value: 'Neu Font',
                service: 'foo.bar.baz',
                weights: [400],
                styles: ['italic', 'regular'],
                variants: [
                  [0, 400],
                  [1, 400],
                ],
                fallbacks: ['fallback1'],
              },
            ],
          },
          actions: {
            maybeEnqueueFontStyle: () => Promise.resolve(),
            getFontByName: () => ({
              name: 'Neu Font',
              value: 'Neu Font',
              service: 'foo.bar.baz',
              weights: [400],
              styles: ['italic', 'regular'],
              variants: [
                [0, 400],
                [1, 400],
              ],
              fallbacks: ['fallback1'],
            }),
            addRecentFont: jest.fn(),
          },
        }}
      >
        <RichTextContext.Provider
          value={{ state: {}, actions: { selectionActions: {} } }}
        >
          {children}
        </RichTextContext.Provider>
      </FontContext.Provider>
    </CanvasContext.Provider>
  );
}

Wrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

describe('Panels/TextStyle', () => {
  let textElement;
  let controls;

  beforeEach(() => {
    global.fetch.resetMocks();

    textElement = {
      id: '1',
      textAlign: 'normal',
      fontSize: 30,
      lineHeight: 1,
      font: {
        family: 'ABeeZee',
      },
      x: 0,
      y: 0,
      height: 100,
      width: 120,
      rotationAngle: 0,
      padding: DEFAULT_PADDING,
    };

    controls = {};

    AdvancedDropDown.mockImplementation(FakeControl);
    ColorInput.mockImplementation(FakeControl);
  });

  function FakeControl(props) {
    controls[props['data-testid']] = props;
    return <div />;
  }

  FakeControl.propTypes = {
    'data-testid': PropTypes.string,
  };

  function arrange(selectedElements, ...args) {
    return renderPanel(TextStyle, selectedElements, Wrapper, ...args);
  }

  it('should render <TextStyle /> panel', () => {
    arrange([textElement]);
    const element = screen.getByRole('button', { name: 'Text' });
    expect(element).toBeInTheDocument();
  });

  it('should recalculate height and offset', () => {
    const { submit } = arrange([textElement]);
    calculateTextHeight.mockImplementation(() => 171);

    const [dx, dy] = calcRotatedResizeOffset(0, 0, 0, 0, 171 - 100);
    const submits = submit({ fontSize: 70 });
    expect(submits[textElement.id]).toStrictEqual({
      fontSize: 70,
      height: 171,
      lineHeight: 1,
      x: dx,
      y: dy,
    });
  });

  describe('FontControls', () => {
    it('should select font', async () => {
      const { pushUpdate } = arrange([textElement]);
      await act(() => controls.font.onChange({ id: 'Neu Font' }));
      expect(pushUpdate).toHaveBeenCalledWith(
        {
          font: {
            family: 'Neu Font',
            service: 'foo.bar.baz',
            styles: ['italic', 'regular'],
            weights: [400],
            variants: [
              [0, 400],
              [1, 400],
            ],
            fallbacks: ['fallback1'],
          },
        },
        true
      );
    });

    // Disable reason: Can't figure out a good way to test this easily
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should select font weight', () => {
      const { pushUpdate } = arrange([textElement]);
      fireEvent.click(screen.getByRole('button', { name: 'Font weight' }));
      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({ content: 'Hello world' });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: '<span style="font-weight: 300">Hello world</span>',
        },
        true
      );
    });

    it('should select font size', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Font size' });

      fireEvent.change(input, { target: { value: '32' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      expect(pushUpdate).toHaveBeenCalledWith({ fontSize: 32 }, true);
    });

    it('should not update font size if empty string is submitted', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Font size' });
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      expect(pushUpdate).not.toHaveBeenCalled();
    });

    it('should set the text bold when the key command is pressed', () => {
      const { pushUpdate, container } = arrange([textElement]);

      fireEvent.keyDown(container, {
        key: 'b',
        which: 66,
        ctrlKey: true,
      });

      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({ content: 'Hello world' });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: '<span style="font-weight: 700">Hello world</span>',
        },
        true
      );
    });

    it('should set the text underline when the key command is pressed', () => {
      const { pushUpdate, container } = arrange([textElement]);

      fireEvent.keyDown(container, {
        key: 'u',
        which: 85,
        ctrlKey: true,
      });

      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({ content: 'Hello world' });
      expect(resultOfUpdating).toStrictEqual(
        {
          content:
            '<span style="text-decoration: underline">Hello world</span>',
        },
        true
      );
    });

    it('should set the text italics when the key command is pressed', () => {
      const { pushUpdate, container } = arrange([textElement]);

      fireEvent.keyDown(container, {
        key: 'i',
        which: 73,
        ctrlKey: true,
      });

      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({ content: 'Hello world' });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: '<span style="font-style: italic">Hello world</span>',
        },
        true
      );
    });
  });

  describe('TextStyleControls', () => {
    it('should set lineHeight', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Line-height' });
      fireEvent.change(input, { target: { value: '1.5' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      expect(pushUpdate).toHaveBeenCalledWith({ lineHeight: 1.5 }, true);
    });

    it('should clear line height if set to empty', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Line-height' });
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      expect(pushUpdate).toHaveBeenCalledWith({ lineHeight: '' }, true);
    });

    it('should set letterSpacing', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Letter-spacing' });
      fireEvent.change(input, { target: { value: '150' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({ content: 'Hello world' });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: '<span style="letter-spacing: 1.5em">Hello world</span>',
        },
        true
      );
    });

    it('should clear letterSpacing if set to empty', () => {
      const { pushUpdate } = arrange([textElement]);
      const input = screen.getByRole('textbox', { name: 'Letter-spacing' });
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter', which: 13 });
      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({
        content: '<span style="letter-spacing: 1.5em">Hello world</span>',
      });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: 'Hello world',
        },
        true
      );
    });
  });

  describe('ColorControls', () => {
    it('should render default black color', () => {
      arrange([textElement]);
      expect(controls['text.color'].value).toStrictEqual(createSolid(0, 0, 0));
    });

    it('should render a color', () => {
      const textWithColor = {
        ...textElement,
        content: '<span style="color: rgb(255, 0, 0)">Hello world</span>',
      };
      arrange([textWithColor]);
      expect(controls['text.color'].value).toStrictEqual(
        createSolid(255, 0, 0)
      );
    });

    it('should set color', () => {
      const { pushUpdate } = arrange([textElement]);
      act(() => controls['text.color'].onChange(createSolid(0, 255, 0)));
      const updatingFunction = pushUpdate.mock.calls[0][0];
      const resultOfUpdating = updatingFunction({
        content: 'Hello world',
      });
      expect(resultOfUpdating).toStrictEqual(
        {
          content: '<span style="color: #0f0">Hello world</span>',
        },
        true
      );
    });

    it('should detect color with multi selection, same values', () => {
      const textWithColor1 = {
        ...textElement,
        content: '<span style="color: rgb(0, 0, 255)">Hello world</span>',
      };
      const textWithColor2 = {
        ...textElement,
        content: '<span style="color: rgb(0, 0, 255)">Hello world</span>',
      };
      arrange([textWithColor1, textWithColor2]);
      expect(controls['text.color'].value).toStrictEqual(
        createSolid(0, 0, 255)
      );
    });

    it('should set color with multi selection, different values', () => {
      const textWithColor1 = {
        ...textElement,
        content: '<span style="color: rgb(0, 0, 255)">Hello world</span>',
      };
      const textWithColor2 = {
        ...textElement,
        content: '<span style="color: rgb(0, 255, 255)">Hello world</span>',
      };
      arrange([textWithColor1, textWithColor2]);
      expect(controls['text.color'].value).toStrictEqual(MULTIPLE_VALUE);
    });
  });

  describe('Mixed value multi-selection', () => {
    it('should display Mixed value in case of mixed value multi-selection', () => {
      const textElement1 = {
        ...textElement,
        font: {
          family: 'Neu Font',
          service: 'foo.bar.baz',
          styles: ['italic', 'regular'],
          weights: [400],
          variants: [
            [0, 400],
            [1, 400],
          ],
          fallbacks: ['fallback1'],
        },
      };
      const textElement2 = {
        ...textElement,
        font: {
          name: 'ABeeZee',
          value: 'ABeeZee',
          service: 'foo.bar.baz',
          weights: [400, 700],
          styles: ['italic', 'regular'],
          variants: [
            [0, 400],
            [1, 400],
            [0, 700],
          ],
          fallbacks: ['serif'],
        },
        fontSize: 36,
        lineHeight: 2.2,
        content:
          '<span style="font-weight: 700; letter-spacing: 0.2em">Hello world</span>',
      };

      arrange([textElement1, textElement2]);

      const letterSpacing = screen.getByRole('textbox', {
        name: 'Letter-spacing',
      });
      expect(letterSpacing.placeholder).toStrictEqual(MULTIPLE_DISPLAY_VALUE);

      const lineHeight = screen.getByRole('textbox', { name: 'Line-height' });
      expect(lineHeight.placeholder).toStrictEqual(MULTIPLE_DISPLAY_VALUE);

      const fontSize = screen.getByRole('textbox', { name: 'Font size' });
      expect(fontSize.placeholder).toStrictEqual(MULTIPLE_DISPLAY_VALUE);

      expect(controls.font.placeholder).toStrictEqual(MULTIPLE_DISPLAY_VALUE);

      const fontWeight = screen.getByRole('button', { name: 'Font weight' });
      expect(fontWeight).toHaveTextContent(MULTIPLE_DISPLAY_VALUE);
    });
  });
});
