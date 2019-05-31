// Define a global variable for protein structure application.
var icn3dui;

$(document).ready(function() {
    var options = {};
    options['proteins'] = 'sphere';
    options['color'] = 'a87a89';

    var cfg = {
      divid: 'icn3dwrap',
      width: 600,
      height: 400,
      resize: false,
      rotate: 'none',
      pdbid: '1RUZ',
      showcommand: true,
    };

    if (Object.keys(options).length > 0) cfg['options'] = options;
    icn3dui = new iCn3DUI(cfg);

    $.when(icn3dui.show3DStructure(),
      icn3dui.hideMenu()).then(function() {
      icn3dui.selectByCommand("$1RUZ.H", "test", "test sel");
      icn3dui.showSelection();
      document.getElementById("remove_selections").addEventListener("click", function() {
        icn3dui.selectByCommand("$1RUZ.H", "test", "test sel");
        icn3dui.setOption('color', 'a87a89');
      });
      // the below button allows a png export of the protein structure
      document.getElementById("save_image").addEventListener("click", function() {
        icn3dui.saveFile("test.png", 'png');
      });
      document.getElementById("send_state").addEventListener("click", function() {
        icn3dui.shareLink();
      });

    });

  });
