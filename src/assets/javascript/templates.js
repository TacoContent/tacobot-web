class Templates {
  /**
   * Locate a DOM node acting as a template by its data-template id.
   * Searches within any container matching div[data-type="template"].
   * @param {string} id - The value of the data-template attribute.
   * @returns {JQuery} Cloned jQuery selection (uncloned original template node(s)).
   */
  static find(id) {
    return $(`div[data-type="template"] [data-template="${id}"]`);
  }

  /**
   * Append a rendered clone of a template to a parent.
   * @param {string|HTMLElement|JQuery} parent - Selector or element to append into.
   * @param {JQuery} template - jQuery object of the template clone (NOT yet customized).
   * @param {(cloned:JQuery)=>JQuery} renderFunc - Mutator that receives the clone and returns it.
   * @returns {JQuery} The rendered content appended to the parent.
   */
  static append(parent, template, renderFunc) {
    const renderedContent = renderFunc(template);
    $(parent).append(renderedContent);
    return renderedContent;
  }

  /**
   * Remove descendants of parent matching a selector.
   * @param {string|HTMLElement|JQuery} parent
   * @param {string} selector
   */
  static remove(parent, selector) {
    $(parent).find(selector).remove();
  }

  /**
   * Empty the parent container completely.
   * @param {string|HTMLElement|JQuery} parent
   */
  static clear(parent) {
    $(parent).empty();
  }

  /**
   * Conditional class logic (currently disabled). Early return keeps feature inert.
   * Planned behavior: add classes based on truthiness / falsiness of data keys.
   * @param {string} key
   * @param {Record<string, any>} data
   */
  static classSetter(key, data) { // eslint-disable-line no-unused-vars
    return; // Feature intentionally disabled; retained for future implementation.
    // const target = $(`[data-class-if="${key}"], [data-class-not-if="${key}"]`);
    // if (target) {
    //   let ifNotClassTarget = target.data('class-not-if');
    //   let ifNotClassName = target.data('class-not-if-class');
    //   let ifClassTarget = target.data('class-if');
    //   let ifClassName = target.data('class-if-class');
    //   if ((!data[ifNotClassTarget] || data[ifNotClassTarget] === '') && ifNotClassName) {
    //     target.addClass(ifNotClassName);
    //   }
    //   if (data[ifClassTarget] && ifClassName) {
    //     target.addClass(ifClassName);
    //   }
    // }
  }

  /**
   * Replace a CSS property value on elements that declare data-style-replace matching the key.
   * @param {string} key - Data key to look for.
   * @param {Record<string, any>} data - The data object being bound.
   * @param {string|HTMLElement|JQuery} parent - Root context for search.
   */
  static styleReplacer(key, data, parent) {
    if (!data[key]) {
      return;
    }
    const target = $(parent).find(`[data-style-replace="${key}"]`);
    const cssProperty = target.data('style-replace-property') || 'NONE';
    if (target && cssProperty !== 'NONE' && data[key]) {
      // Dev log left intentionally for traceability; remove or guard behind debug flag if noisy.
      console.log(`styleReplacer: ${key} => ${cssProperty} => ${data[key]}`);
      target.css(cssProperty, data[key]);
    }
  }

  /**
   * High-level helper: clone a template, bind all data keys, append to parent.
   * @param {string|HTMLElement|JQuery} parent - Container to which rendered node will be appended.
   * @param {string} templateId - Value of data-template to locate.
   * @param {Record<string, any>} data - Key/value pairs used for binding.
   * @returns {JQuery|undefined} The rendered node or undefined if no data provided.
   */
  static render(parent, templateId, data) {
    if (!data) {
      return;
    }
    const template = Templates.find(templateId).clone();
    const renderFunc = (clonedTemplate) => {
      Object.keys(data).forEach(key => {
        const target = clonedTemplate.find(`[data-bind="${key}"]`);
        const targetAttr = target.data(`bind-${key.toLowerCase()}-attr`);
        const emptyOnBind = Boolean(target.data('bind-empty') || "false");
        if (target) {
          Templates.classSetter(key, data, clonedTemplate);
          Templates.styleReplacer(key, data, clonedTemplate);
          if (targetAttr) {
            if (emptyOnBind) {
              target.empty();
            }
            target.attr(targetAttr, data[key]);
          } else {
            target.text(data[key]);
          }
        }
      });
      return clonedTemplate;
    };
    return Templates.append(parent, template, renderFunc);
  }
}