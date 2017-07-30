(function ($) {
  'use strict';

  $(document).ready(function () {
    if (!window.ModuleSupportCheck) {
      $('#browserAdvice').css('padding-top', '0');

      var $slider = $('.main__content__slid + .main__content__slider');
      $slider.css('padding-top', '0');
      $slider.css('visibility', 'visible');
    }
  });
})(window.jQuery);
