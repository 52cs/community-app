/**
 * Settings page component.
 */
import React, { createRef, useState } from 'react';
import PT from 'prop-types';
import MetaTags from 'components/MetaTags';

import { TABS } from 'actions/page/settings';

import _ from 'lodash';
import Header from './Header';
import Tools from './Tools';

import './style.scss';
import Account from './Account';
import Preferences from './Preferences';
import TabSelector from './TabSelector';
import { SETTINGS_TABS } from './constants';

import ProfileSettings from './ProfileSettings';

export default function Settings(props) {
  const newProps = { ...props };
  if (newProps.settingsTab === newProps.match.params.settingsTab) {
    newProps.settingsTab = newProps.settingsTab;
  } else {
    newProps.settingsTab = newProps.match.params.settingsTab;
  }

  const selectTab = (tab) => {
    newProps.history.push(`/settings/${tab}`);
  };

  const currentTab = _.find(SETTINGS_TABS, { link: newProps.settingsTab });
  const title = currentTab ? currentTab.title : 'Settings';
  const childRef = createRef();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div styleName="container" className="profile-settings" role="presentation" onClick={() => {}}>
      <MetaTags
        title={`${title} | TopCoder`}
        description="Profile setting page for Topcoder member"
      />
      <div styleName="page">
        <Header
          settingsTab={newProps.settingsTab}
          selectTab={selectTab}
          saveSettings={() => {
            childRef.current.onSaveBasicInfo();
          }}
          isSaving={isSaving}
        />
        <TabSelector activeTab={newProps.settingsTab} tabs={SETTINGS_TABS} selectTab={selectTab} />
        {
          newProps.settingsTab === TABS.PROFILE
          && (
            <ProfileSettings
              {...newProps}
              ref={childRef}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
            />
          )
        }
        {
          newProps.settingsTab === TABS.TOOLS
          && (
            <Tools
              {...newProps}
            />
          )
        }
        {
          newProps.settingsTab === TABS.ACCOUNTS
          && (
            <Account
              {...newProps}
            />
          )
        }
        {
          newProps.settingsTab === TABS.PREFERENCES
          && (
            <Preferences
              {...newProps}
            />
          )
        }
      </div>
    </div>
  );
}

Settings.propTypes = {
  settingsTab: PT.string.isRequired,
  profileState: PT.shape().isRequired,
  settingsPageState: PT.shape().isRequired,
  history: PT.shape().isRequired,
  selectTab: PT.func.isRequired,
};
