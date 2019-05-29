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
    var icn3dui = new iCn3DUI(cfg);

    $.when(icn3dui.show3DStructure(),
      icn3dui.hideMenu(600, 600)).then(function() {
      icn3dui.selectByCommand("$1RUZ.H", "test", "test sel");
      icn3dui.showSelection();
      document.getElementById("my_button").addEventListener("click", function() {
        icn3dui.selectByCommand("$1RUZ.H:" + xx, "test2", "test sel");
        icn3dui.setOption('color',  document.getElementById("myColor").value);
      });
      document.getElementById("my_button2").addEventListener("click", function() {
        icn3dui.selectByCommand("$1RUZ.H", "test", "test sel");
        icn3dui.setOption('color', 'a87a89');
      });
    });

  });
