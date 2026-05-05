(function () {
  const path = window.location.pathname;
  let cleanPath = "";

  if (path.endsWith("/index.html")) {
    cleanPath = path.slice(0, -"index.html".length) || "/";
  } else if (path.endsWith(".html")) {
    cleanPath = path.slice(0, -".html".length);
  }

  if (cleanPath && cleanPath !== path) {
    window.history.replaceState(null, "", `${cleanPath}${window.location.search}${window.location.hash}`);
  }
})();
