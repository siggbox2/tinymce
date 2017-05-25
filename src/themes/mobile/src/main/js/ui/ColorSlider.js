define(
  'tinymce.themes.mobile.ui.ColorSlider',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Slider',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.ToolbarWidgets'
  ],

  function (Behaviour, Toggling, Slider, Css, Styles, ToolbarWidgets) {
    var BLACK = -1;

    var makeSlider = function (spec) {
      var getColor = function (hue) {
        // Handle edges.
        if (hue < 0) {
          return 'black';
        } else if (hue > 360) {
          return 'white';
        } else {
          return 'hsl(' + hue + ', 100%, 50%)';
        }
      };

      // Does not fire change intentionally.
      var onInit = function (slider, thumb, value) {
        var color = getColor(value);
        Css.set(thumb.element(), 'background-color', color);
      };

      var onChange = function (slider, thumb, value) {
        var color = getColor(value);
        Css.set(thumb.element(), 'background-color', color);
        spec.onChange(slider, thumb, color);
      };

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('slider'), Styles.resolve('hue-slider-container') ]
        },
        components: [
          Slider.parts()['left-edge'](),
          Slider.parts().spectrum(),
          Slider.parts()['right-edge'](),
          Slider.parts().thumb()
        ],

        onChange: onChange,
        onDragStart: function (thumb) {
          Toggling.on(thumb);
        },
        onDragEnd: function (thumb) {
          Toggling.off(thumb);
        },
        onInit: onInit,
        stepSize: 10,
        min: 0,
        max: 360,
        getInitialValue: spec.getInitialValue,

        parts: {
          spectrum: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-gradient-container') ]
            },
            components: [
              {
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('slider-gradient') ]
                }
              }
            ]
          },
          thumb: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-thumb') ]
            },
            behaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: 'selected'
              })
            ])
          },
          'left-edge': {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('hue-slider-black') ]
            }
          },
          'right-edge': {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('hue-slider-white') ]
            }
          }
        }
      });
    };

    var makeItems = function (spec) {
      return [
        makeSlider(spec)
      ];
    };

    var sketch = function (realm, editor) {
      var spec = {
        onChange: function (slider, thumb, color) {
          editor.undoManager.transact(function () {
            editor.formatter.apply('forecolor', { value: color });
            editor.nodeChanged();
          });
        },
        getInitialValue: function (/* slider */) {
          // Return black
          return BLACK;
        }
      };

      return ToolbarWidgets.button(realm, 'color', function () {
        return makeItems(spec);
      });
    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);