exports.capitalize = function (str) {
  return str.split(' ').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

exports.toggleDiv = function (element) {
  $(element).next('div').toggle('medium');
}