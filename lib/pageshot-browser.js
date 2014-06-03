/* global window */
(function( pageshot, undefined ) {

    // Private Property
    var quit = false;

    // Public Property
    pageshot.pending = {};

    // Private Method

    // Public Method
    pageshot._init = function() {
      setTimeout(function() {
        window.onPageshotReady();
      }, 1);
    };

    pageshot.emit = function(action, options) {
      var obj = {
        'action': action,
        'options': options
      };
      var str = JSON.stringify(obj);
      console.log('Pageshot:'+str);
    };

    pageshot.quit = function() {
      quit = true;
      // Trigger quit
      var name = "quit";
      pageshot.emit(name);
      // Render a promise
      var p = new pageshot.Promise(name);
      // Return promise
      return p;
    };

    pageshot.shouldQuit = function() {
        return quit;
    };

    pageshot.Promise = function(name) {
      var p = pageshot.pending[name];
      // Create promise
      p = p ? p : {
        //
        _success: [],
        _fail: [],
        //
        then: function(success, fail) {
          this._success.push(success);
          this._fail.push(fail);
          return this;
        }
      };
      // Register promise
      pageshot.pending[name] = p;
      return p;
    };

    pageshot.continue = function(name, successful) {
      var promise = pageshot.pending[name];
      // Get pending, for success or fail
      var pending;
      if (successful) {
        pending = promise._success;
      } else {
        pending = promise._fail;
      }
      // Execute callbacks
      for (var i = 0, len=pending.length; i<len; i++) {
        var c = pending[i];
        c();
      }
      // De-register
      delete pageshot.pending[name];
    };

    pageshot.shoot = function(name, format, quality) {
      // Use defaults if not set
      name = name ? name : +(new Date());
      format = format ? format : 'png';
      quality = quality ? quality : 100;
      // Trigger shoot
      pageshot.emit('shoot', {
        'name': name,
        'format': format,
        'quality': quality
      });
      // Render a promise
      var n = name;
      var p = new pageshot.Promise(n);
      // Return promise
      return p;
    };


}( window.pageshot = window.pageshot || {} ));
// Start
window.pageshot._init();
