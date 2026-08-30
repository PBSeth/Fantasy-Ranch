if (typeof renderNotFound === 'function' && typeof renderMethodology === 'function') {
  renderMethodology = function() { location.hash = 'home'; };
}
if (location.hash.replace(/^#/, '').split('/')[0] === 'methodology') {
  location.hash = 'home';
}
