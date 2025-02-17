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
 * Internal dependencies
 */
import { List } from '../../../../design-system';
import { useStory } from '../../../app';
import { PRIORITY_COPY } from '../../../app/prepublish/newConstants';
import { states, useHighlights } from '../../../app/highlights';
import { ChecklistCard, ChecklistCardStyles } from '../../checklistCard';
import { hasNoFeaturedMedia } from '../utils';

const FEATURED_MEDIA_RESOURCE_MIN_HEIGHT = 853;
const FEATURED_MEDIA_RESOURCE_MIN_WIDTH = 640;

export function storyPosterPortraitSize(story) {
  if (hasNoFeaturedMedia(story)) {
    return false;
  }

  return (
    story.featuredMedia?.height < FEATURED_MEDIA_RESOURCE_MIN_HEIGHT ||
    story.featuredMedia?.width < FEATURED_MEDIA_RESOURCE_MIN_WIDTH
  );
}

const StoryPosterPortraitSize = () => {
  const { story } = useStory(({ state }) => state);
  const setHighlights = useHighlights(({ setHighlights }) => setHighlights);

  const { footer, title } = PRIORITY_COPY.posterTooSmall;

  return (
    storyPosterPortraitSize(story) && (
      <ChecklistCard
        title={title}
        titleProps={{
          onClick: () => setHighlights({ highlight: states.POSTER }),
        }}
        footer={
          <ChecklistCardStyles.CardListWrapper>
            <List>{footer}</List>
          </ChecklistCardStyles.CardListWrapper>
        }
      />
    )
  );
};

export default StoryPosterPortraitSize;
