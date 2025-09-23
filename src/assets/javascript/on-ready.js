$(() => {
  BootstrapInitializer.initialize();
});

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
    $(document).off('error', 'img[data-img-error]')
      .on('error', 'img[data-img-error]', function () {
        const transparentPng =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+F2ZcAAAAASUVORK5CYII=';
        const fallback = $(this).attr('data-img-error');
        if (fallback && fallback.startsWith('data:image/')) {
          $(this).attr('src', fallback);
        } else {
          $(this).attr('src', transparentPng);
        }
      });
  }
  static register(ele) {
    $(ele).off('error')
      .on('error', function () {
        const transparentPng =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+F2ZcAAAAASUVORK5CYII=';
        const fallback = $(this).attr('data-img-error');
        if (fallback && fallback.startsWith('data:image/')) {
          $(this).attr('src', fallback);
        } else {
          $(this).attr('src', transparentPng);
        }
      });
  }
}
