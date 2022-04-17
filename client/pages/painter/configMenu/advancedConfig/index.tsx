import * as React from 'react';
import ReplaceConfig from './ReplaceConfig';
import FollowOptionsConfig from './FollowOptionsConfig';
import ListConfig from './ListConfig';
import CoverToConfig from './CoverToConfig';

export default function AdvancedConfig() {
  return (
    <>
      <ReplaceConfig />
      <FollowOptionsConfig />
      <ListConfig />
      <CoverToConfig />
    </>
  );
}
