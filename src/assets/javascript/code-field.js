$(() => {

  $('[data-copy]').on('focus', function () {
    // select the text when the input is focused
    $(this).select();
  });

  $('[data-copy-target]').on('click', function () {
    const target = $(this).data('copy-target');
    const inputGroup = $(this).closest('.input-group');
    console.log('Copy target', target);
    const $source = $(target, inputGroup);
    console.log('Copying from', $source);

    const value = $source.text().trim();
    const $temp = $('<input>');
    $temp
      .css('position', 'absolute')
      .css('left', '-1000px')
      .val(value);

    $('body').append($temp);
    $temp.select();
    document.execCommand('copy');
    $temp.remove();
    $source.select();

    if (toastr) {
      toastr.success('successfully copied to clipboard');
    }
  });

  $('[data-toggle-spoiler]').on('click', function (event) {
    const target = $(this).data('toggle-spoiler');
    console.log('Toggle spoiler target', target);
    const inputGroup = $(this).closest('.input-group');
    const $spoiler = $(target, inputGroup);
    console.log('Toggling spoiler for', $spoiler);
    $spoiler.toggleClass('spoiler');
    const isHidden = $spoiler.hasClass('spoiler');
    const eventTarget = $(event.currentTarget);
    console.log('Event target', eventTarget);
    // find the icon within the button that was clicked
    const $icon = $('i', eventTarget).clone();
    $('i', eventTarget).remove();
    $icon.empty().removeClass('fa-eye fa-eye-slash').removeAttr('data-fa-i2svg');
    // remove data-fa-i2svg attribute from the $icon
    console.log('Icon', $icon, isHidden);
    // Remove both fa-eye and fa-eye-slash, then add the correct one
    if (isHidden) {
      $icon.addClass('fas fa-eye');
    } else {
      $icon.addClass('fas fa-eye-slash');
    }
    eventTarget.append($icon);
    $spoiler.focus();
    if (window.FontAwesome && FontAwesome.dom && FontAwesome.dom.i2svg) {
      console.log('Re-rendering icons');
      FontAwesome.dom.i2svg();
      $icon.hide().show(0);
    }
  });
})