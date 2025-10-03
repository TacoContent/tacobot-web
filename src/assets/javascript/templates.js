class Templates {

  static find(id) {
    return $(`div[data-type="template"] [data-template="${id}"]`);
  }

  static append(parent, template, renderFunc) {
    const renderedContent = renderFunc(template);

    $(parent).append(renderedContent);

    return renderedContent;
  }

  static remove(parent, selector) {
    $(parent).find(selector).remove();
  }

  static clear(parent) {
    $(parent).empty();
  }

  static classSetter(key, data) {
    return;
    const target = $(`[data-class-if="${key}"], [data-class-not-if="${key}"]`);
    if (target) {
      let ifNotClassTarget = target.data('class-not-if');
      let ifNotClassName = target.data('class-not-if-class');
      let ifClassTarget = target.data('class-if');
      let ifClassName = target.data('class-if-class');

      if ((!data[ifNotClassTarget] || data[ifNotClassTarget] === '') && ifNotClassName) {
        target.addClass(ifNotClassName);
      }
      if (data[ifClassTarget] && ifClassName) {
        target.addClass(ifClassName);
      }
    }
  }

  static styleReplacer(key, data, parent) {
    if (!data[key]) {
      return;
    }
    const target = $(parent).find(`[data-style-replace="${key}"]`);
    // find the css property to replace
    const cssProperty = target.data('style-replace-property') || 'NONE';
    if (target && cssProperty !== 'NONE' && data[key]) {
      console.log(`styleReplacer: ${key} => ${cssProperty} => ${data[key]}`);
      
      target.css(cssProperty, data[key]);
    }
  }

  static render(parent, templateId, data) {
    if (!data) {
      return;
    }
    const template = Templates.find(templateId).clone();

    const renderFunc = (clonedTemplate) => {
      /*
        <div data-template="foodSuggestions" data-bind-value-attr="value">
          <img src="..." class="food-suggestion-image mr-2" data-bind="img" data-bind-img-attr="src"/>
          <span class="food-suggestion-name" data-bind="value"></span>
        </div>
      */
      Object.keys(data).forEach(key => {
        // console.log(`key: ${key}`);
        // find the `data-bind-attr` attribute and set its text
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
            // console.log(`bind: ${targetAttr} => ${data[key]}`);
            target.attr(targetAttr, data[key]);
          } else {
            // console.log(`bind: text => ${data[key]}`);
            target.text(data[key]);
          }
        }
      });
      return clonedTemplate;
    };
    return Templates.append(parent, template, renderFunc);
  }
}