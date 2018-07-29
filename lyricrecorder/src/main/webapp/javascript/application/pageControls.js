var updatePageDetails = function(json) {
	$('#trackTitle').html(json.title);
	$('#trackArtist').html(json.artist);
	$('#trackAlbum').html(json.album);
}

var updateConsole = function(text) {
	var holder = document.getElementById('fileUploadHolder');
	holder.innerHTML = text;
	$('#fileUploadHolder').scrollTop($('#fileUploadHolder')[0].scrollHeight);
}
var clearConsole = function(text) {
	var holder = document.getElementById('fileUploadHolder');
	holder.innerHTML = "";
}

function loadCreateTab() {
	$('#currentTab').removeClass('visibleTab');
	$('#loadTab').removeClass('visibleTab');
	$('#currentTab').addClass('hiddenTab');
	$('#loadTab').addClass('hiddenTab');
	$('#newTab').removeClass('hiddenTab');
	$('#newTab').addClass('visibleTab');
}
function loadCurrentTab() {
	$('#newTab').removeClass('visibleTab');
	$('#loadTab').removeClass('visibleTab');
	$('#newTab').addClass('hiddenTab');
	$('#loadTab').addClass('hiddenTab');
	$('#currentTab').removeClass('hiddenTab');
	$('#currentTab').addClass('visibleTab');
}
function loadLoadTab() {
	$('#currentTab').removeClass('visibleTab');
	$('#newTab').removeClass('visibleTab');
	$('#currentTab').addClass('hiddenTab');
	$('#newTab').addClass('hiddenTab');

	$('#loadTab').removeClass('hiddenTab');
	$('#loadTab').addClass('visibleTab');
}

function addClickToLyrics() {
	$(function() {
		$(".word").click(function(event) {
			wordClicked(event.target.id);
		});
	});
	$(function() {
		$(".word").mouseover(function(event) {
			wordMouseOver(event.target.id);
		});
	});
	$(function() {
		$(".word").mouseout(function(event) {
			wordMouseOut(event.target.id);
		});
	});
}

function playPause() {
	var vid = document.getElementById("audio");
	if (vid.paused) {
		vid.play();
		$('#playPause').val("Pause");
	} else {
		vid.pause();
		$('#playPause').val("Play");
	}
}

var currentlyAddingWord = false;

function formatTime(number) {
	// return number.toFixed(2); // this seems to break drag and drop!
	return number;
}

function addCurrentWordStart() {
	if (($("#audio").prop("currentTime") * 1000) > currentStateStore.highestEndTime
			&& currentStateStore.nextWordToAddId != "") {
		currentStateStore.currentlyAddingWord = true;
		findWordById(currentStateStore.nextWordToAddId);
		var aLineObject = currentStateStore.lineArray[currentStateStore.currentLineIndex];
		var aWordObject = aLineObject.words[currentStateStore.currentWordIndex];
		aWordObject.startTime = formatTime($("#audio").prop("currentTime") * 1000);

		if (currentStateStore.currentWordIndex == 0) {
			aLineObject.startTime = formatTime($("#audio").prop("currentTime") * 1000);
		}

		currentStateStore.currentSelectedWordId = aWordObject.id;
		$('#wordInfoId').val(currentStateStore.currentSelectedWordId)

		$('#wordInfoWord').val(
				aWordObject.word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
		$('#wordInfoStartTime')
				.val(
						millisecondsToISOMinutesSecondsMilliseconds(aWordObject.startTime));
		$('#wordInfoEndTime').val("");

		$('.word').removeClass("wordSelected");
		$(
				'#word_' + currentStateStore.currentLineIndex + "_"
						+ currentStateStore.currentWordIndex).addClass(
				"wordSelected");

		$('.word').removeClass("nextWordToAdd");
		$('.word').removeClass("wordBeingAdded");
		$('#' + aWordObject.id).addClass("wordBeingAdded");
	} else {
		console.log("You can't add words out of order!!!");
	}

}

function addCurrentWordEnd() {
	if (currentStateStore.currentlyAddingWord
			&& currentStateStore.nextWordToAddId != "") {
		var aLineObject = currentStateStore.lineArray[currentStateStore.currentLineIndex];
		var aWordObject = aLineObject.words[currentStateStore.currentWordIndex];
		currentStateStore.currentlyAddingWord = false;
		aWordObject.endTime = formatTime($("#audio").prop("currentTime") * 1000);
		$('#wordInfoEndTime')
				.val(
						millisecondsToISOMinutesSecondsMilliseconds(aWordObject.endTime));
		$(
				'#word_' + currentStateStore.currentLineIndex + "_"
						+ currentStateStore.currentWordIndex).addClass(
				"wordHasTime");
		currentStateStore.lastAddedWordId = aWordObject.id;
		currentStateStore.highestEndTime = aWordObject.endTime;
		currentStateStore.currentWordIndex++;
		if (currentStateStore.currentWordIndex >= aLineObject.words.length) {
			currentStateStore.currentWordIndex = 0;
			aLineObject.endTime = formatTime($("#audio").prop("currentTime") * 1000);
			currentStateStore.currentLineIndex++;
			var container = $('#lyrics')
			var scrollTo = $('#' + currentStateStore.currentSelectedWordId);
			container.scrollTop((scrollTo.offset().top - 0)
					- container.offset().top + container.scrollTop());
		}
		if (currentStateStore.currentLineIndex < currentStateStore.lineArray.length) {
			aLineObject = currentStateStore.lineArray[currentStateStore.currentLineIndex];
			aWordObject = aLineObject.words[currentStateStore.currentWordIndex];
			currentStateStore.nextWordToAddId = aWordObject.id;
			$('#playLine_' + currentStateStore.currentLineIndex).removeClass(
					'playLineDisabled');
			$('.word').removeClass("nextWordToAdd");
			$(
					'#word_' + currentStateStore.currentLineIndex + "_"
							+ currentStateStore.currentWordIndex).addClass(
					"nextWordToAdd");
		} else {
			console.log("No More words to add");
			currentStateStore.nextWordToAddId = "";
		}
	} else {
		console.log("You can't add an end time without a start time");
	}
}

function lineArrayToJSON() {
	// html = JSON.stringify($.toJSON(currentStateStore.lineArray), null, 2);
	return $.toJSON(currentStateStore.lineArray);
}
function lineArrayToLRC() {
	var lrc = "";
	var words;
	var word;
	for (var i = 0; i < currentStateStore.lineArray.length; i++) {
		lrc += "["
				+ millisecondsToISOMinutesSecondsMilliseconds(currentStateStore.lineArray[i].startTime)
				+ "]";
		words = currentStateStore.lineArray[i].words;
		for (var j = 0; j < words.length; j++) {
			if (j != 0) {
				lrc += " ";
			}
			word = words[j];
			lrc += word.word
		}
		lrc += "\n";
	}
	return lrc;
}
function lineArrayToEnhancedLRC() {
	var lrc = "";
	var words;
	var word;
	for (var i = 0; i < currentStateStore.lineArray.length; i++) {
		lrc += "["
				+ millisecondsToISOMinutesSecondsMilliseconds(currentStateStore.lineArray[i].startTime)
				+ "]";
		words = currentStateStore.lineArray[i].words;
		for (var j = 0; j < words.length; j++) {
			if (j != 0) {
				lrc += " ";
			}
			word = words[j];
			lrc += "<"
					+ millisecondsToISOMinutesSecondsMilliseconds(word.startTime)
					+ ">";
			lrc += word.word
			lrc += "<"
					+ millisecondsToISOMinutesSecondsMilliseconds(word.endTime)
					+ ">";
		}
		lrc += "\n";
	}
	return lrc;
}

function enableView(tabItemId, viewId) {
	enableViewTabs(tabItemId);

	$('.viewContainer').each(function(index) {
		$(this).hide();
	});
	$('#' + viewId).show();
	$('#wordButtonContainer').hide();
	$('#videoControls').hide();

	if (tabItemId == "enableUploadView") {
		currentStateStore.currentLyricView = "UPLOAD_VIEW";
	} else if (tabItemId == "enableTextView") {
		console.log("Hello alex");
		currentStateStore.currentLyricView = "TEXT_VIEW";
		
		convertSyncLyricsToText();
		

	} else if (tabItemId == "enableWordView") {
		if (currentStateStore.currentLyricView === "TEXT_VIEW") {
			convertLyricTextToWords();
		}
		$('#wordButtonContainer').show();
		currentStateStore.currentLyricView = "WORD_VIEW";
	} else if (tabItemId == "enableVideoView") {
		currentStateStore.currentLyricView = "VIDEO_VIEW";
		
		//drawVideoPanels('video', 'videoControls');
		$('#videoControls').show();
		
		console.log("Resize for video!!");
		cleanUpAnalyzer();
		startVisualisation();
	}
}

function convertSyncLyricsToText()
{
	
	
	var syncedWords=currentStateStore.lineArray;
	

}

function enableViewTabs(itemId) {
	$('.viewTabs').each(function(index) {
		$(this).addClass('buttonUnselected');
	});
	$('#' + itemId).removeClass('buttonUnselected');
}

function convertTextToLyrics(textToShow) {
	$('#lyricText').val(textToShow)
	var html = "";
	if (textToShow) {
		html = textToShow;
	} else {

		for (var i = 0; i < currentStateStore.lineArray.length; i++) {
			words = currentStateStore.lineArray[i].words;
			for (var j = 0; j < words.length; j++) {
				if (j != 0) {
					html += " ";
				}
				html += words[j].word;
			}
			html += "\n";
			$('#lyricText').html(html);
		}
		currentStateStore.lineArray.length = 0;
		currentStateStore.onlyWordsArray.length = 0;
	}
	$('#lyricText').html(html);
	currentStateStore.currentLyricView = "TEXT_VIEW";
}
