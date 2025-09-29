import dates from './dates';
import sections from './sections';
import operators from './operators';
import * as sitemap from './sitemap';
import uuid from './uuid';
import numbers from './numbers';
import json from './json';
import fields from './fields';

const helpers = {
  ...dates,
  ...sections,
  ...operators,
  ...sitemap,
  ...uuid,
  ...numbers,
  ...json,
  ...fields,
};

export default helpers;