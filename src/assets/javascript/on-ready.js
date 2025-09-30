$(() => {
  BootstrapInitializer.initialize();
  ImageErrorHandler.initialize();
  InputSetter.initialize();
  FormSubmitter.initialize();
  DurationPickerInitializer.initialize();
});

class DurationPickerInitializer {
  static initialize() {
    const elements = document.querySelectorAll('input[data-type="duration"]');
    elements.forEach(element => {
      if (!$(element).data('durationPicker')) {
        $(element).durationPicker({
          showSeconds: true,
          showDays: true,
          daysLabel: 'd',
          hoursLabel: 'h',
          minutesLabel: 'm',
          secondsLabel: 's',
          totalMax: 60 * 60 * 24 * 365 // 1 year in seconds
        });
      }
    });
  }
}

class BootstrapInitializer {
  static initialize() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }
}

class ImageErrorHandler {
  static initialize() {
    ImageErrorHandler.registerAll();
  }
  static registerAll() {

    const handler = function () {
      console.log('Image load error, applying fallback for', this);
      const transparentPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const fallback = $(this).attr('data-img-error');
      if (fallback && fallback.startsWith('data:image/')) {
        $(this).attr('src', fallback);
      } else {
        $(this).attr('src', transparentPng);
      }
    };

    $(document).off('error', 'img[data-img-error]')
      .on('error', 'img[data-img-error]', handler);

    $('img[data-img-error]').off('error').on('error', handler);
  }
  static register(ele) {
    $(ele).off('error')
      .on('error', function () {
        const transparentPng =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const fallback = $(this).attr('data-img-error');
        if (fallback && fallback.startsWith('data:image/')) {
          $(this).attr('src', fallback);
        } else {
          $(this).attr('src', transparentPng);
        }
      });
  }
}

class FormSubmitter {
  static initialize() {
    const elements = document.querySelectorAll('[data-submit]');
    elements.forEach(element => {
      element.addEventListener($(element).attr('data-event') || 'click', (e) => {
        e.preventDefault();
        const targetSelector = $(element).attr('data-submit');
        console.log(`Submitting form ${targetSelector}`);
        if (targetSelector) {
          const form = $(element).closest(targetSelector);
          if (form && form.length > 0) {
            form.submit();
          }
        }
      });
    });
  }
}

class InputSetter {
  static initialize() {
    const elements = document.querySelectorAll('[data-set]');
    elements.forEach(element => {
      element.addEventListener($(element).attr('data-event') || 'click', (e) => {
        e.preventDefault();
        const targetSelector = $(element).attr('data-set');
        const value = $(element).attr('data-value') || '';
        const attr = $(element).attr('data-attr') || 'value';
        console.log(`Setting ${attr} of ${targetSelector} to ${value}`);
        if (targetSelector) {
          const target = document.querySelector(targetSelector);
          if (target) {
            if (attr === 'value') {
              $(target).val(value);
            } else {
              $(target).attr(attr, value);
            }
            const event = new Event('input', { bubbles: true });
            target.dispatchEvent(event);
          }
        }
      });
    });
  }
}