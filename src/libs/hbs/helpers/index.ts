import dates from './dates';
import sections from './sections';
import operators from './operators';
import * as sitemap from './sitemap';
import uuid from './uuid';
import numbers from './numbers';
import json from './json';

const helpers = {
  ...dates,
  ...sections,
  ...operators,
  ...sitemap,
  ...uuid,
  ...numbers,
  ...json,
};

export default helpers;