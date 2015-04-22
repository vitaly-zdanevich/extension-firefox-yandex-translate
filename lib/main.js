var contextMenu = require("sdk/context-menu");
var Request = require("sdk/request").Request;
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var translating = 'translating...';

var menuItem = contextMenu.Item({
	label: translating,
	image: self.data.url('ico.png'),
	context: contextMenu.SelectionContext(),
	contentScript: 'self.on("context", function() {' +
						'self.postMessage(window.getSelection().toString());' +
						'return true;' +
					'});' +
					'self.on("click", function() {' +
						'tabs.open("https://translate.yandex.by/?text=" + window.getSelection().toString());' + // this is not working here
					'})',
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


