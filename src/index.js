const { getMostRecentBrowserWindow } = require('sdk/window/utils');
require("sdk/simple-prefs").on('hotkeyReplace', onChangeHotkeyReplaceSelected);
require("sdk/simple-prefs").on('hotkeyPopup', onChangeHotkeyPopup);
require("sdk/simple-prefs").on('apiKey', onKeySet);
require("sdk/simple-prefs").on('context', onPrefChangeContextShowOrNot);

var
	uuid = require('sdk/util/uuid').uuid(),
	uuidstr = uuid.number.substring(1, 37),
	notifications = require("sdk/notifications"),
	contextMenu = require("sdk/context-menu"),
	Request = require("sdk/request").Request,
	self = require('sdk/self'),
	data = require('sdk/self').data,
	tabs = require('sdk/tabs'),
	{ Hotkey } = require("sdk/hotkeys");
	selection = require('sdk/selection'),
	prefs = require('sdk/simple-prefs').prefs,
	cmitems = null,
	{ ActionButton } = require('sdk/ui/button/action'),

	wasTranslated = false,
	inProgress = '...',
	translated = '',
	selectionText = '',
	apiKey = prefs.apiKey ? prefs.apiKey : "trnsl.1.1.20150823T200149Z.8e278ae355e9c41b.106d24775a3c7e6b9b39270d7a455555244952fa",

	buttonPopupWithTranslation = ActionButton({
		id: 'buttonPopupWithTranslation',
		label: getLabelForPopupButton(),
		icon: './ico-white.png',
		context: contextMenu.SelectionContext(),
		contentScriptFile: data.url('contentScript.js'),
		onClick: function() {
			if (selection.text != null) // Merge duplicated onClick and onPress to named function and call it here? Not working
				translate('ru', selection.text, apiKey); // default direction - from EN to RU
		}
	}),
	hotkeyPopup = setHotkeyFromPrefsForTranslatingAndPopup(), // this line must be here because here we set hotkey for previously created UI-button 

	buttonReplaceSelectedText = ActionButton({
		id: 'buttonReplaceText',
		label: getLabelForReplacementButton(),
		icon: './ico.png',
		context: contextMenu.SelectionContext(),
		contentScriptFile: data.url('contentScript.js'),
		onClick: function() {
			if (selection.text != null) // Merge duplicated onClick and onPress to named function and call it here? Not working
				translate('ru', selection.text, apiKey, function() {selection.html = translated;}); // default direction - from EN to RU
		}
	}),
	hotkeyReplace = setHotkeyFromPrefsForTranslatingAndReplacementSelectedText(), // this line must be here because here we set hotkey for previously created UI-button 


	buttonTranslateFullPage = ActionButton({
		id: 'buttonTranslateFullPage',
		label: 'Translate full page',
		icon: './ico-full.svg',
		context: contextMenu.SelectionContext(),
		onClick: function() {
			translateFullPage();
		}
	}),

	menuItem = getContextMenuItem()
;

function translate(lang, input, apiKey, callback) {
	if (input.length > 0)
		Request({ // key is not referral but API-key: https://api.yandex.com/translate/doc/dg/concepts/api-overview.xml
			url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=' + apiKey + '&lang=' + lang + '&text=' + input,
			onComplete: function(response) {
				if (prefs.tts) tts(input);
				if (response && response.json.code == 200) { // ok
					translated = response.json.text[0];
					if (input.trim() == translated.trim() && wasTranslated == false) {
						// if input on Russian and we receive the same text -
						// translate again selected text into English
						translate('en', input, apiKey, callback);
						wasTranslated = true;
					} else { // show results
						if (prefs.context) menuItem.label = translated;
						wasTranslated = false;
						if (prefs.popup) popup(translated);
						if (prefs.context && prefs.tooltip && !callback) tooltip(translated);
						if (callback) callback(); // replace selected text by translated
					}
				} else { // not ok - key ended
					if (prefs.context) menuItem.label = ':(';
					notifications.notify({
						title: 'API-key ended - for continue of translating please get another one, it is free',
						text: 'Click here for opening page when you can get another API-key. After getting key - insert in preferences of this addon.\n\nResponse from Yandes: \n\n' + response.text,
						time: 50000,
						onClick: function() {
							tabs.open('https://tech.yandex.com/keys/get/?service=trnsl');
						}
					})
				}
			}
		}).get();
}

function translateFullPage() {
	tabs.open('https://translate.yandex.by/web?url=' + tabs.activeTab.url);
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
	if (cmitems[0])
		cmitems[0].tooltipText = cmitems[0].value.substring(36);
}

function onChangeHotkeyPopup() {
	setHotkeyFromPrefsForTranslatingAndPopup();
}

function onChangeHotkeyReplaceSelected() {
	setHotkeyFromPrefsForTranslatingAndReplacementSelectedText();
}

function setHotkeyFromPrefsForTranslatingAndPopup() {
	if (hotkeyPopup) hotkeyPopup.destroy();
	if (prefs.hotkeyPopup.length > 0) {
		buttonPopupWithTranslation.label = getLabelForPopupButton();
		var hotkeyPopup = Hotkey({
			combo: prefs.hotkeyPopup,
			onPress: function() {
				if (selection.text != null)
					translate('ru', selection.text, apiKey); // default direction - from EN to RU
			}
		})
	} else { // user remove hotkey
		buttonPopupWithTranslation.label = 'Hotkey is not set';
	}
}

function setHotkeyFromPrefsForTranslatingAndReplacementSelectedText() {
	if (hotkeyReplace) hotkey.destroy();
	if (prefs.hotkeyReplace.length > 0) {
		buttonReplaceSelectedText.label = getLabelForReplacementButton();
		var hotkeyReplace = Hotkey({
			combo: prefs.hotkeyReplace,
			onPress: function() {
				if (selection.text != null)
					translate('ru', selection.text, apiKey, function() {selection.html = translated;}); // default direction - from EN to RU
			}
		})
	} else { // user remove hotkey
		buttonReplaceSelectedText.label = 'Hotkey is not set';
	}
}

function setHotkeyFromPrefsForTranslatingAndReplacementSelectedText() {
	if (hotkeyReplace) hotkey.destroy();
	if (prefs.hotkeyReplace.length > 0) {
		buttonReplaceSelectedText.label = getLabelForReplacementButton();
		var hotkeyReplace = Hotkey({
			combo: prefs.hotkeyReplace,
			onPress: function() {
				if (selection.text != null)
					translate('ru', selection.text, apiKey, function() {selection.html = translated;}); // default direction - from EN to RU
			}
		})
	} else { // user remove hotkey
		buttonReplaceSelectedText.label = 'Hotkey is not set';
	}
}

function onKeySet() {
	apiKey = prefs.apiKey;
}

function onPrefChangeContextShowOrNot() {
	if (!prefs.context) 
		menuItem.destroy();
	else
		menuItem = getContextMenuItem();
}

function getContextMenuItem() {
	return prefs.context ? contextMenu.Item({
		data: uuidstr, // for 'binding' tooltop's 'id' + text
		label: inProgress, // ...
		image: self.data.url('ico.png'),
		context: contextMenu.SelectionContext(),
		contentScriptFile: data.url('contentScript.js'),
		onMessage: function(message) {
			if (message.name == 'context') {
				menuItem.label = inProgress; // ...
				if (cmitems != undefined && cmitems[0]) cmitems[0].tooltipText = '';
				var input = message.data.replace('&', '%26');
				translate('ru', input, apiKey); // default direction - from EN to RU
			} else { // if (message.name == 'click')
				tabs.open(message.data);
			}
		}
	}) : null;
}

function getLabelForPopupButton() {
	return 'Translate selected text and show in popup. Current hotkey: ' + prefs.hotkeyPopup;
}

function getLabelForReplacementButton() {
	return 'Replace selected text with translated. Current hotkey: ' + prefs.hotkeyReplace;
}

function tts(input) {
	var window = require('sdk/window/utils').getMostRecentBrowserWindow();
	var audio = (!prefs.ttsGoogle)  ? new window.Audio('http://tts.voicetech.yandex.net/tts?format=mp3&quality=hi&platform=web&application=unofficialFirefoxAddonByVitalyZdanevich&lang=en_GB&text='+input)
								    : new window.Audio('https://translate.google.com/translate_tts?tl=en&client=t&q='+input)
	audio.play();
}