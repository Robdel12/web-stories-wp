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
import { __ } from '@web-stories-wp/i18n';
import { UnitsProvider } from '@web-stories-wp/units';

/**
 * Internal dependencies
 */
import { Headline, THEME_CONSTANTS } from '../../../../../../design-system';
import {
  PageSizePropType,
  TemplatesPropType,
  TemplateActionsPropType,
} from '../../../../../types';
import { TemplateGridView } from '../../../shared';
import { RowContainer } from '../../components';

function RelatedGrid({ pageSize, relatedTemplates, templateActions }) {
  if (relatedTemplates.length === 0) {
    return null;
  }

  return (
    <RowContainer>
      <Headline size={THEME_CONSTANTS.TYPOGRAPHY.PRESET_SIZES.SMALL} as="h3">
        {__('Related Templates', 'web-stories')}
      </Headline>

      <UnitsProvider
        pageSize={{
          width: pageSize.width,
          height: pageSize.height,
        }}
      >
        <TemplateGridView
          templates={relatedTemplates}
          pageSize={pageSize}
          templateActions={templateActions}
        />
      </UnitsProvider>
    </RowContainer>
  );
}

RelatedGrid.propTypes = {
  pageSize: PageSizePropType,
  relatedTemplates: TemplatesPropType,
  templateActions: TemplateActionsPropType,
};

export default RelatedGrid;
