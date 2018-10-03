// From Lindsey Simon
/**
 * This is a hack to make text input focus work in Android/PhoneGap
 * where calling el.focus() doesn't actually have the blinking cursor
 * effect = scumbag.
 * @param {Zepto} $el A zepto element.
 */
ws.focus = function($el) {
  var el = $el.get(0);
  el.focus();
  el.setSelectionRange && el.setSelectionRange(0, 0);
};

