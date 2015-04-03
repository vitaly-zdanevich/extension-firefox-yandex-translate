var contextMenu = require("sdk/context-menu");
var translated = '...';
const {Cc,Ci} = require("chrome");
var xmlhttp = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

var menuItem = contextMenu.Item({
  label: "translating...",
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("context", function() {' +
                 '  var selectionText = window.getSelection().toString();' +
                 '  self.postMessage(selectionText);' +
                 '  return true;' +
                 '});',
                  onMessage: function(selectionText) {
                      xmlhttp.onreadystatechange=function() {
                        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
  	                        var json = JSON.parse(xmlhttp.responseText);
                            translated = json.text[0];
                            // console.log(translated);
                            menuItem.label = translated;
                        }
                      }
                      xmlhttp.open("GET","https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150402T173446Z.82a90fe78ca2aeaf.a3bd7c7a0f72b260e28f5d92e4f242cf6ba189d3&lang=ru&text="+selectionText,true);
                      xmlhttp.send();
                  }
});


