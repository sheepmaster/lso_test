// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function () {
  var globalLso;
  var swfContainerId = "_swf_container";

  var lso = new EventTarget();

  function swfCallback(cookie) {
    globalLso = {};
    var fields = cookie.split(/&/);
    fields.forEach(function(field) {
      var key_value = field.split(/=/);
      globalLso[key_value[0]] = key_value[1];
    });

    // remove the flash object now
    var swf = document.getElementById(swfContainerId);
    if (swf && swf.parentNode) {
      swf.parentNode.removeChild(swf);
    } else {
      console.error('Couldn\'t find Flash <embed>');
    }

    console.log(JSON.stringify(globalLso));

    var event = new Event('change');
    event.lso = globalLso;
    lso.dispatchEvent(event);
  }

  function createSwf(new_values) {
    var div = document.getElementById(swfContainerId),
      flashvars = {},
      params = {},
      attributes = {};
    if (div) {
      throw new Error('Callback already in flight');
    }
    
    div = document.createElement("div");
    div.setAttribute("id", swfContainerId);
    document.body.appendChild(div);

    if (new_values) {
      var values = [];
      for (var key in new_values) {
        values.push(key + '=' + new_values[key]);
      }
      flashvars.everdata = values.join('&');
    }
    params.swliveconnect = "true";
    attributes.name      = "myswf";
    swfobject.embedSWF("evercookie.swf", swfContainerId, "1", "1", "9.0.0", false, flashvars, params, attributes);
  }

  lso.set = function(key, value, callback) {
    var lso = this;
    function eventListener(event) {
      lso.removeEventListener('change', eventListener);
      callback();
    };
    this.addEventListener('change', eventListener);
    var newValues = {};
    newValues[key] = value;
    createSwf(newValues);
  };

  // Create the <embed> to initialize |globalLso|.
  document.addEventListener('DOMContentLoaded', createSwf);

  // Export
  window.lso = lso;
  window._evercookie_flash_var = swfCallback;
})();