// Define a global variable for protein structure application.
var icn3dui;

$(document).ready(function() {
    var options = {};
    options['proteins'] = 'sphere';
    options['color'] = 'grey';
    options['pk'] = 'residue';
    options['background'] = 'white';

    var cfg = {
      divid: 'icn3dwrap',
      width: 375,
      height: 468,
      resize: false,
      rotate: 'none',
      url:"?type=pdb&url=https%3A%2F%2Fwww.rcsb.org%2Fstructure%2F4O5N",
      //pdbid: '4O5N',
      showmenu:false,
      showcommand: false
    };
    cfg

    if (Object.keys(options).length > 0) cfg['options'] = options;
    icn3dui = new iCn3DUI(cfg);

    $.when(
      icn3dui.show3DStructure(),
      icn3dui.downloadUrl("_data/4O5N_trimer.pdb", "pdb")
    ).then(function() {
      icn3dui.selectByCommand(".A,B");
      icn3dui.showSelection();
      icn3dui.rotStruc("right");
      icn3dui.rotStruc("down");

      document.getElementById("remove_selections").addEventListener("click", function() {
        icn3dui.setOption('color', "grey");
      });

      // the below button allows a png export of the protein structure
      document.getElementById("save_image").addEventListener("click", function() {
        icn3dui.saveFile("test.png", 'png');
      });
      document.getElementById("send_state").addEventListener("click", function() {
        icn3dui.shareLink();
      });
      document.getElementById("confirm").addEventListener("click", function() {
        cfg['showcommand'] = true;
        cfg['options'] = options
        icn3dui = new iCn3DUI(cfg);
        icn3dui.show3DStructure();
        icn3dui.downloadUrl("_data/4O5N_trimer.pdb", "pdb");
        icn3dui.selectByCommand(".A,B");
        icn3dui.showSelection();
        //icn3dui.saveFile("test_file.txt", "text");
      });
    });

});
