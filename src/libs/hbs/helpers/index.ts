import dates from './dates';
import sections from './sections';
import operators from './operators';
import * as sitemap from './sitemap';
import uuid from './uuid';
import numbers from './numbers';
import strings from './strings';
import settings from './settings';
import discord from './discord';
import objects from './objects';
import arrays from './arrays';

const helpers = {
  ...dates,
  ...sections,
  ...operators,
  ...sitemap,
  ...uuid,
  ...numbers,
  ...strings,
  ...settings,
  ...discord,
  ...objects,
  ...arrays,
};

export default helpers;