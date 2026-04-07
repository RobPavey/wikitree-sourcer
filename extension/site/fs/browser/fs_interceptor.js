(function () {
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;

  // 1. Wrap the 'open' method to capture the URL
  XHR.open = function (method, url) {
    this._url = url;
    return open.apply(this, arguments);
  };

  // 2. Wrap the 'send' method to listen for the response
  XHR.send = function () {
    this.addEventListener("load", function () {
      if (this._url && this._url.includes("/matches?collection=records")) {
        try {
          const data = JSON.parse(this.responseText);
          window.postMessage(
            {
              type: "FS_SIMILAR_RECORDS_DATA",
              payload: data,
            },
            "*"
          );
        } catch (err) {
          // Not JSON or other error
        }
      }
    });
    return send.apply(this, arguments);
  };
})();
