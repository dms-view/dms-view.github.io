var opentype = require('opentype.js');

function logoplot() {
// opentype.load('fonts/Roboto-Black.ttf', function(err, font) {
//     if (err) {
//         alert('Font could not be loaded: ' + err);
//     } else {
//         // Now let's display it on a canvas with id "canvas"
//         var ctx = document.getElementById('canvas').getContext('2d');
//
//         // Construct a Path object containing the letter shapes of the given text.
//         // The other parameters are x, y and fontSize.
//         // Note that y is the position of the baseline.
//         var path = font.getPath('Hello, World!', 0, 150, 72);
//
//         // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
//         path.draw(ctx);
//     }
// });
var c = document.getElementById("#logoplot_chart");
var ctx = c.getContext("2d");
ctx.rect(20, 20, 150, 100);
ctx.stroke();
};

var logoplot = logoplot("#logoplot_chart");
