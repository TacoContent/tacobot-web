import dates from './dates';
import sections from './sections';
import operators from './operators';
import * as sitemap from './sitemap';

const helpers = {
  ...dates,
  ...sections,
  ...operators,
  ...sitemap,
};

export default helpers;