/*
 * Copyright 2021 Google LLC
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
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ReactComponent as icon } from '../images/icon.svg';
import deprecated from './deprecated';
import save from './save';
import edit from './edit';
import metadata from './block';
import { BLOCK_TYPE_LATEST_STORIES, GRID_VIEW_TYPE } from './constants';
import transforms from './transforms';

const { name, category, attributes } = metadata;

const settings = {
  title: __('Web Stories', 'web-stories'),
  description: __('Embed Web Stories.', 'web-stories'),
  category,
  icon,
  keywords: [
    /* translators: block keyword. */
    __('embed', 'web-stories'),
    /* translators: block keyword. */
    __('web stories', 'web-stories'),
    /* translators: block keyword. */
    __('story', 'web-stories'),
    /* translators: block keyword. */
    __('stories', 'web-stories'),
  ],
  attributes,
  example: {
    attributes: {
      blockType: BLOCK_TYPE_LATEST_STORIES,
      viewType: GRID_VIEW_TYPE,
      numberOfColumns: 2,
    },
  },
  supports: {
    align: ['wide', 'full', 'left', 'right', 'center'],
  },
  deprecated,
  edit,
  save,
  transforms,
};

export { metadata, name, icon, settings };
