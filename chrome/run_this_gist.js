var ideoneLanguages = {
	plain: "",
	html: "",
	css: "",
	xml: "",
	sh: "bash"
};

function langFromClassName(className) {
	var matched = className.match(/type\-(\w+)/);
	if (!matched && !matched[1]) {
		return "";
	}
	var gistLang = matched[1];
	if (ideoneLanguages[gistLang] || ideoneLanguages[gistLang] === "") {
		return ideoneLanguages[gistLang];
	} else {
		return gistLang;
	}
}

function parseCode(lineElements) {
	var lines = [];
	for (var i=0; i<lineElements.length; i++) {
		lines[i] = lineElements[i].textContent;
	}
	return lines.join("\n");
}

function asTable(object) {
	var result = "";
	if (object.output) {
		result += '<tr class="run-this-gist-output-row"><th>Output</th><td><pre>' + object.output +'</pre></td></tr>';
		delete object.output;
	}
	if (object.stderr) {
		result += '<tr class="run-this-gist-stderr-row"><th>STDERR</th><td><pre>' + object.stderr +'</pre></td></tr>';
		delete object.stderr;
	}
	if (object.link) {
		result += '<tr class="run-this-gist-link-row"><th></th><td><a href="' + object.link +'">'+ object.link +'</a></td></tr>';
		delete object.link;
	}
	for (var key in object) {
		var value = object[key];
		if (value && value.indexOf && value.indexOf("http://") === 0) {
			value = "<a href='"+ value +"'>"+ value +"</a>";
		}
		result += '<tr class=run-this-gist-"'+ key +'-row"><th>'+ key +'</th><td>' + value +'</td></tr>';
	}
	return result ? '<table>'+result+"</table>" : "";
}


var files = document.querySelectorAll("#files .file");

for (var i=0; i<files.length; i++) {
	var file = files[i];
	var dataElement = file.querySelector(".data");
	if (!dataElement)
		continue;

	var button = document.createElement("input");
	button.type = "button";
	button.className = "run-this-gist";
	button.value = "Run";

	var lang = langFromClassName(dataElement.className);
	if (!lang)
		continue;

	button.addEventListener("click", function buttonClicked(e) {
		var code = parseCode(dataElement.querySelectorAll(".line"));
		var data = "code=" + encodeURIComponent(code) + "&lang=" + lang;
		button.disabled = true;
		chrome.extension.sendRequest(data, function requested(response){
			response = JSON.parse(response);
			var result = document.createElement("div");
			result.className = "run-this-gist-result";
			if (response.stderr) {
				result.className += " run-this-gist-error";
			}
			result.innerHTML = asTable(response);
			file.appendChild(result);
			button.disabled = false;
		});
	});
	
	file.querySelector(".actions").appendChild(button);
}
