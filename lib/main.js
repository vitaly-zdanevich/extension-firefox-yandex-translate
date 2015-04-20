var contextMenu = require("sdk/context-menu");
var translating = 'translating...';
var Request = require("sdk/request").Request;

var menuItem = contextMenu.Item({
	label: translating,
	context: contextMenu.SelectionContext(),
	contentScript: 'self.on("context", function() {' +
					'var selectionText = window.getSelection().toString();' +
					'self.postMessage(selectionText);' +
					'return true;' +
				'});',
				onMessage: function(selectionText) {
					// var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150402T173446Z.82a90fe78ca2aeaf.a3bd7c7a0f72b260e28f5d92e4f242cf6ba189d3&lang=ru&text='+selectionText;
					// console.log(url);
					menuItem.label = translating;
					Request({
						// key is not referral but API-key: https://api.yandex.com/translate/doc/dg/concepts/api-overview.xml
						url: "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150402T173446Z.82a90fe78ca2aeaf.a3bd7c7a0f72b260e28f5d92e4f242cf6ba189d3&lang=ru&text="+selectionText,
						onComplete: function(response) {
							var translated = response.json.text[0];
							// console.log(translated);
							menuItem.label = translated;
						}
					}).get();
				}
});


