const { getMostRecentBrowserWindow } = require('sdk/window/utils');
var uuid = require('sdk/util/uuid').uuid();
var uuidstr = uuid.number.substring(1, 37);
var notifications = require("sdk/notifications");
var contextMenu = require("sdk/context-menu");
var Request = require("sdk/request").Request;
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var prefs = require('sdk/simple-prefs').prefs;
var cmitems = null;

var wasTranslatedSecondTime = false;
var inProgress = '...';
var translated = '';
var selectionText = '';

function getSelectedText(win,doc) {
	//Adapted from a post by jscher2000 at:
	//  http://forums.mozillazine.org/viewtopic.php?f=25&t=2268557
	//Is supposed to solve the issue of Firefox not getting the text of a selection when
	// it is in a textarea/input/textbox.
	var ta;
	if (win.getSelection && doc.activeElement){
		if (doc.activeElement.nodeName == "TEXTAREA" ||
			(doc.activeElement.nodeName == "INPUT" &&
			doc.activeElement.getAttribute("type").toLowerCase() == "text")
		){
			ta = doc.activeElement;
			return ta.value.substring(ta.selectionStart, ta.selectionEnd);
		} else {
			//As of Firefox 31.0 this appears to have changed, again.
			//Type multiple methods to cover bases with different versions of Firefox.
			let returnValue = "";
			if (typeof win.getSelection === "function"){
				returnValue = win.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length >0) {
					return returnValue
				}
			} //else
			if (typeof win.getSelection === "function"){
				returnValue = win.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length >0) {
					return returnValue
				}
			} //else
			if (typeof win.content.getSelection === "function"){
				returnValue = win.content.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length >0) {
					return returnValue
				}
			} //else
			//It appears we did not find any selected text.
			return "";
		}
	} else {
		return doc.getSelection().toString();
	}
}

var menuItem = contextMenu.Item({
	data: uuidstr, // for 'binding' tooltop's 'id' + text
	label: inProgress, // ...
	image: self.data.url('ico.png'),
	context: contextMenu.SelectionContext(),
	contentScript: 'self.on("context", function() {' +
						'selectionText = getSelectedText(window, document);' +
						'self.postMessage({name:"context", data:selectionText});' +
						'return true;' +
					'});' +
					'self.on("click", function() {' +
						'self.postMessage({name:"click", data:"https://translate.yandex.ru?text=" + selectionText.replace("&", "%26")});' +
					'})',
	onMessage: function(message) {
		if (message.name == 'context') {
			menuItem.label = inProgress; // ...
			if (cmitems != undefined) cmitems[0].tooltipText = '';
			var input = message.data.replace('&', '%26');
			translate('ru', input); // default direction - from EN to RU
		} else { // if (message.name == 'click')
			tabs.open(message.data);
		}
	}
});

function translate(lang, input) {
	Request({ // key is not referral but API-key: https://api.yandex.com/translate/doc/dg/concepts/api-overview.xml
		url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150627T071448Z.117dacaac1e63b79.6b1b4bb84635161fcd400dace9fb2220d6f344ef&lang=' +
																					lang + '&text=' + input,
		onComplete: function (response) {
			translated = response.json.text[0];
			if (input == translated && wasTranslatedSecondTime == false) {  // if input on Russian and we receive the same text -
				translate('en', input);                                     // translate again selected text into English
				wasTranslatedSecondTime = true;
			} else { // show results
				if (prefs.popup) popup(translated);
				menuItem.label = translated;
				wasTranslatedSecondTime = false;
				if (prefs.tooltip) tooltip(translated);
			}
		}
	}).get();
}

function popup(text) {
	if (text.length > 0)
		notifications.notify({
			title: 'translate.yandex.ru',
			text: text,
			time: 5000
		})
}

function tooltip(translated) {
	menuItem.data = uuidstr + translated;
	cmitems = getMostRecentBrowserWindow().document.querySelectorAll(".addon-context-menu-item[value^='"+uuidstr+"']");
	cmitems[0].tooltipText = cmitems[0].value.substring(36);
}



