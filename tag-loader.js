(function () {
  var scriptLoaded = false;
  var events = ['mousemove', 'scroll', 'keydown', 'touchstart'];

  function loadScript() {
    if (scriptLoaded) return;
    scriptLoaded = true;

    events.forEach(function (evt) {
      document.removeEventListener(evt, loadScript);
    });

    var adopt = document.createElement('script');
    adopt.src = 'https://tag.goadopt.io/injector.js?website_code=6415b6fd-ed25-4988-a574-192592ff3ff4';
    adopt.classList.add('adopt-injector');
    document.head.appendChild(adopt);

    var claydar = document.createElement('script');
    claydar.src = 'https://static.claydar.com/init.v1.js?id=c2MAFh3wMN';
    document.head.appendChild(claydar);

    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-KR7P5LK');
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadScript, { timeout: 4000 });
  } else {
    setTimeout(loadScript, 4000);
  }

  events.forEach(function (evt) {
    document.addEventListener(evt, loadScript, { once: true, passive: true });
  });
})();