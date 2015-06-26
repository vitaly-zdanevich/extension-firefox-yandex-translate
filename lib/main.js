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
						'var selectionText = window.getSelection().toString();' +
						'self.postMessage({name:"context", data:selectionText});' +
						'return true;' +
					'});' +
					'self.on("click", function() {' +
						'var selectionText = window.getSelection().toString();' +
						'self.postMessage({name:"click", data:"https://translate.yandex.ru?text=" + selectionText});' +
					'})',
	onMessage: function(message) {
		if (message.name == 'context') {
			menuItem.label = translating;
			translate('ru', message.data)
		} else {
			tabs.open(message.data);
		}
	}
});

function translate(lang, input) {
	Request({ // key is not referral but API-key: https://api.yandex.com/translate/doc/dg/concepts/api-overview.xml
		url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150402T173446Z.82a90fe78ca2aeaf.a3bd7c7a0f72b260e28f5d92e4f242cf6ba189d3&lang=' +
																					lang + '&text=' + input,
		onComplete: function (response) {
			var translated = response.json.text[0];
			if (input == translated) {
				translate('en', input);
			} else {
				menuItem.label = translated;
			}
		}
	}).get();
}


