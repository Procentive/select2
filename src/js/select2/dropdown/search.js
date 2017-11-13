define([
  'jquery',
  '../utils'
], function ($, Utils) {
  function Search () { }

  Search.prototype.render = function (decorated) {
    var $rendered = decorated.call(this);

    var $search = $(
      '<span class="select2-search select2-search--dropdown">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="none"' +
        ' spellcheck="false" role="textbox" aria-autocomplete="list" />' +
      '</span>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    $rendered.prepend($search);

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    this.$search.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();
    });

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$search.on('input', function (evt) {
      // Unbind the duplicated `keyup` event
      $(this).off('keyup');
    });

    this.$search.on('keyup input', function (evt) {
      self.handleSearch(evt);
    });

    container.on('open', function () {
      self.$search.attr('tabindex', 0);

      window.setTimeout(function () {
        if(self.$search && self.$search.length && document.documentElement.contains(self.$search[0])) {
          self.$search.focus();
        } else {
          self.$container.find('.select2-selection').focus();
        }
      }, 0);
    });

    container.on('close', function () {
      self.$search.attr('tabindex', -1);

      self.$search.val('');
    });

    container.on('focus', function () {
      if (!container.isOpen()) {
        self.$search.focus();
      }
    });

    container.on('results:all', function (params) {
      if (params.query.term == null || params.query.term === '') {
        var showSearch = self.showSearch(params);

        if (showSearch) {

          // If search will show, we need to treat $selection like a dropdown
          var selection = self.$container.find('.select2-selection');

          // These attributes will be removed from selection and added to search
          var attributesToTransfer = [
            'role',
            'aria-autocomplete',
            'aria-haspopup',
            'aria-activedescendant',
            'aria-controls'
          ];

          for (var i = 0; i < attributesToTransfer.length; i++) {
            var tmpAttr = selection.attr(attributesToTransfer[i]);

            if (attributesToTransfer[i] === 'aria-controls') {
              var newAriaControls = tmpAttr.split('-results')[0] + '-resultDropdown';
              self.$searchContainer.find('input').attr('aria-owns', tmpAttr);
              selection.attr('aria-controls', newAriaControls);
              self.$dropdown.attr({ role: 'region', 'id': newAriaControls });
            } else {
              selection.removeAttr(attributesToTransfer[i]);
              self.$searchContainer.find('input').attr(attributesToTransfer[i], tmpAttr);
            }
          }
        } else {
          if(self.$search.is(':focus')) {
            self.$container.find('.select2-selection').focus();
          }
          self.$searchContainer.remove();
        }
      }
    });
  };

  Search.prototype.handleSearch = function (evt) {
    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.showSearch = function (_, params) {
    return true;
  };

  return Search;
});
