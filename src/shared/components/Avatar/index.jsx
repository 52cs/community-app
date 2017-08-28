/**
 * Avatar
 *
 * Description:
 *   Reusable user avatar. Depending on wether or not an image URL is
 *   provided, it will display the user's profile picture, or a default
 *   user avatar.
 *
 * Styling:
 *  By default the avatar is round-shaped. Custom styling may be applied using
 *  react-css-themr.
 *
 * Usage:
 *   <Avatar url={imgUrl} theme={customeTheme} />
 *
 * Props:
 *    - theme: Object, optional. Parent-provided theme.
 *    - url: String, optional. Image URL.
 */

import PT from 'prop-types';
import React from 'react';
import _ from 'lodash';
import { themr } from 'react-css-themr';
import DefaultAvatar from '../../../assets/images/ico-user-default.svg';
import defaultStyle from './style.scss';

function Avatar({ theme, url, handleError }) {
  return url
    ? <img alt="Avatar" src={url} className={theme.avatar} onError={handleError} />
    : <DefaultAvatar className={theme.avatar} />;
}

Avatar.defaultProps = {
  customStyles: null,
  theme: {
    avatar: '',
  },
  url: null,
  handleError: _.noop,
};

Avatar.propTypes = {
  theme: PT.shape({
    avatar: PT.string.isRequired,
  }),
  url: PT.string,
  handleError: PT.func,
};

export default themr('Avatar', defaultStyle)(Avatar);
