import dates from './dates';
import sections from './sections';
import operators from './operators';
import * as sitemap from './sitemap';
import uuid from './uuid';

const helpers = {
  ...dates,
  ...sections,
  ...operators,
  ...sitemap,
  ...uuid
};

export default helpers;