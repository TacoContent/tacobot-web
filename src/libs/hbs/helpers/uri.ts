import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  buildQueryString: function (this: any, ...args: any[]): string {
    // first arg is object with current query params
    // rest are strings like "key=value" to add or update
    console.log("buildQueryString: args:", args);
    const queryParamsObj = args[0];
    // Filter out non-string arguments (like the Handlebars options object)
    const paramsToAdd = args.slice(1).filter(arg => typeof arg === 'string');

    if (typeof queryParamsObj !== 'object' || queryParamsObj === null) {
      console.error("buildQueryString: invalid queryParamsObj:", queryParamsObj);
      return '';
    }
    const queryParams: Record<string, string> = {};
    // copy existing params
    for (const key in queryParamsObj) {
      if (queryParamsObj.hasOwnProperty(key)) {
        console.debug("buildQueryString: existing param:", key, "=", queryParamsObj[key]);
        queryParams[key] = String(queryParamsObj[key]);
      }
    }
    // add/update params from paramsToAdd
    for (const param of paramsToAdd) {
      const [key, value] = param.split('=');
      if (key) {
        console.debug("buildQueryString: adding/updating param:", key, "=", value);
        queryParams[key] = value || '';
      }
    }
    // build query string
    const queryString = Object.keys(queryParams)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
      .join('&');
    console.debug("buildQueryString: result:", queryString);
    return queryString ? '?' + queryString : '';
  }
}