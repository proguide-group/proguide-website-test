(function() {
  const devHostnames = ['localhost', '127.0.0.1'];
  const isDev = devHostnames.includes(window.location.hostname);
  if (!isDev) {
    const noop = () => {};
    ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
      if (typeof console[method] === 'function') {
        console[method] = noop;
      }
    });
  }
  window.IS_DEV = isDev;
})();
