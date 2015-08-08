self.on("context", function() {
	selectionText = getSelectedText(window, document);
	self.postMessage({name:"context", data:selectionText});
	return true;
});
self.on("click", function() {
	self.postMessage({name:"click", data:"https://translate.yandex.ru?text=" + selectionText.replace("&", "%26")});
});
self.on('translated', function(translatedText) {
	console.log(translatedText);
});

function getSelectedText(win,doc) {
	// Adapted from a post by jscher2000 at http://forums.mozillazine.org/viewtopic.php?f=25&t=2268557
	// Is supposed to solve the issue of Firefox not getting the text of a selection when
	// it is in a textarea/input/textbox.
	var ta;
	if (win.getSelection && doc.activeElement){
		if (doc.activeElement.nodeName == 'TEXTAREA' || doc.activeElement.getAttribute("id") == 'text' ||
			(doc.activeElement.nodeName == 'INPUT' &&
			doc.activeElement.getAttribute("type").toLowerCase() == 'text')
		){
			ta = doc.activeElement;
			translate();
			return ta.value.substring(ta.selectionStart, ta.selectionEnd);
		} else {
			// As of Firefox 31.0 this appears to have changed, again.
			// Type multiple methods to cover bases with different versions of Firefox.
			let returnValue = "";
			if (typeof win.getSelection === "function"){
				returnValue = win.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} //else
			if (typeof doc.getSelection === "function"){
				returnValue = doc.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} // else
			if (typeof win.content.getSelection === "function"){
				returnValue = win.content.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} // else
			// It appears we did not find any selected text.
			return "";
		}
	} else {
		return doc.getSelection().toString();
	}
}

function translate() {
	Request({ // key is not referral but API-key: https://api.yandex.com/translate/doc/dg/concepts/api-overview.xml
		url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150627T071448Z.117dacaac1e63b79.6b1b4bb84635161fcd400dace9fb2220d6f344ef&lang=ru&input=sex',
		onComplete: function (response) {
			translated = response.json.text[0];
			console.log(translated);
		}
	}).get();
}