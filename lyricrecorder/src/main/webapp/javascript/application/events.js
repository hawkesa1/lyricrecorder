var fileUploader;
var lyricTracker;
var currentStateStore;

var videoCanvas;
var videoContext;
var word1Canvas;
var word1Context;
var word2Canvas;
var word2Context;

$(document).ready(
		function($) {
			console.log("The Document is Ready!");
			fileUploader = new FileUploader(document
					.getElementById('fileUploadHolder'));
			
			lyricTracker = new LyricTracker($('#canvasContainer'));
			
			currentStateStore = new CurrentStateStore();
			
			enableView("enableUploadView", "fileUploadHolder");
			
			main();
			startVisualisation();
		
			//videoCanvas = document.getElementById('videoCanvas');
			//videoContext = videoCanvas.getContext('2d');
			//word1Canvas = document.getElementById('word1Canvas');
			//word1Context = word1Canvas.getContext('2d');
			//word2Canvas = document.getElementById('word2Canvas');
			//word2Context = word2Canvas.getContext('2d');
			
			//initialiseParameters();
		});
$(function() {
	$("#save").click(
			function() {
				console.log(currentStateStore)
				saveLyricsToBrowser(currentStateStore.trackMetaData,
						currentStateStore.currentSongId);
			});
});

$(function() {
	$("#generateVideo").click(
			function() {
				generateVideo(currentStateStore.trackMetaData,
						currentStateStore.currentSongId);
			});
});

$(function() {
	$("#loadButton").click(function() {
		loadTrack();
		loadCurrentTab();
	});
});
$(function() {
	$("#lyricTextButton").click(function() {
		convertLyricTextToWords();
	});
});
$(function() {
	$("#wordInfoPlay").click(function() {
		var wordId = $('#wordInfoId').val();
		var lineIndex = wordId.split('_')[1];
		var wordIndex = wordId.split('_')[2];
		var aLineObject = currentStateStore.lineArray[lineIndex];
		var aWordObject = aLineObject.words[wordIndex];
		playWord(aWordObject);
	});
});

$(function() {
	$("#wordInfoPlayLine")
			.click(
					function() {
						var wordId = $('#wordInfoId').val();
						var lineIndex = wordId.split('_')[1];
						var wordIndex = 0;
						var aLineObject = currentStateStore.lineArray[lineIndex];
						var aWordObject = aLineObject.words[wordIndex];
						var vid = document.getElementById("audio");
						if (aWordObject.startTime && aWordObject.startTime >= 0) {
							vid.currentTime = aWordObject.startTime / 1000;
							vid.play();
							currentStateStore.stopAtTime = aLineObject.words[aLineObject.words.length - 1].endTime;
						}
					});
});
$(function() {
	$("#playPauseButton").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		if (vid.paused) {
			vid.play();
			
			
			
			$('#playPauseButton').text("Pause");
		} else {
			vid.pause();
			$('#playPauseButton').text("Play");
		}
	});
});

$(function() {
	$("#playSlowButton").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		if (vid.playbackRate == 0.5) {
			$("#playSlowButton").text("Slow");
			$("#playFastButton").text("Fast");
			vid.playbackRate = 1;
		} else {
			$("#playSlowButton").text("Normal");
			$("#playFastButton").text("Fast");
			vid.playbackRate = 0.5;
		}
		vid.play();
	});
});
$(function() {
	$("#playFastButton").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		if (vid.playbackRate == 2) {
			$("#playFastButton").text("Fast");
			$("#playSlowButton").text("Slow");
			vid.playbackRate = 1;
		} else {
			$("#playSlowButton").text("Slow");
			$("#playFastButton").text("Normal");
			vid.playbackRate = 2;
		}
		vid.play();
	});
});

$(function() {
	$("#mute").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		if (vid.muted) {
			$("#mute").text("Mute")
			vid.muted = false;
		} else {
			$("#mute").text("Unmute")
			vid.muted = true;
		}
	});
});
$(function() {
	$("#skipBack5Button").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		vid.currentTime = vid.currentTime - 5;
	});
});
$(function() {
	$("#skipForward5Button").click(function(e) {
		e.preventDefault();
		var vid = document.getElementById("audio");
		vid.currentTime = vid.currentTime + 5;
	});
});

$(function() {
	$("#enableUploadView").click(function(e) {
		e.preventDefault();
		enableView("enableUploadView", "fileUploadHolder");
	});
});

$(function() {
	$("#enableTextView").click(function(e) {
		e.preventDefault();
		enableView("enableTextView", "lyricText");
	});
});
$(function() {
	$("#enableWordView").click(function(e) {
		e.preventDefault();
		enableView("enableWordView", "lyrics");
	});
});
$(function() {
	$("#enableVideoView").click(function(e) {
		e.preventDefault();
		enableView("enableVideoView", "video");
	});
});

$(function() {
	$("#addCurrentWord").mouseup(function() {
		if (!document.getElementById('audio').paused) {
			addCurrentWordEnd();
		}
	});
});
$(function() {
	$("#addCurrentWord").mousedown(function() {
		if (!document.getElementById('audio').paused) {
			addCurrentWordStart();
		}
	});
});
$(function() {
	$("#removePreviousWord").mouseup(
			function() {
				var word = findWordById(currentStateStore.lastAddedWordId);
				delete word.startTime;
				delete word.endTime;
				$('#lyrics').html(generateLyrics(currentStateStore.lineArray));
				addClickToLyrics();

				var container = $('#lyrics')
				var scrollTo = $('#' + currentStateStore.nextWordToAddId);
				container.scrollTop((scrollTo.offset().top)
						- container.offset().top + container.scrollTop());
			});
});

var rtime;
var timeout = false;
var delta = 500;
$(window).resize(function() {
	rtime = new Date();
	if (timeout === false) {
		timeout = true;
		setTimeout(resizeend, delta);
	}
});

function resizeend() {
	if (new Date() - rtime < delta) {
		setTimeout(resizeend, delta);
	} else {
		timeout = false;
		cleanUpAnalyzer()
		startVisualisation();
	}
}
var spaceIsDown = false;
$(document).keydown(
		function(e) {
			if (e.keyCode == 32 && e.target == document.body) {
				e.preventDefault();
			}
			if (e.which == 32 && !spaceIsDown
					&& currentStateStore.currentLyricView === "WORD_VIEW") {
				e.preventDefault();
				$('#addCurrentWord').mousedown();
				$('#addCurrentWord').addClass("activeProgramatically");
				spaceIsDown = true;
			}
		});
$(document).keyup(function(e) {
	if (e.keyCode == 32 && e.target == document.body) {
		e.preventDefault();
	}
	if (e.which == 32 && currentStateStore.currentLyricView === "WORD_VIEW") {
		e.preventDefault();
		$('#addCurrentWord').mouseup();
	}
	$('#addCurrentWord').removeClass("activeProgramatically");
	spaceIsDown = false;
	return true;
});
