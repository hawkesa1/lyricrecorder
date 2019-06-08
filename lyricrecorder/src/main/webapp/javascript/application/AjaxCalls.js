function loadTutorial() {
	var audio = document.getElementById('audio');
	audio.src = "./resources/tutorial/TUTORIAL.MP3";
	loadWaveForm('./resources/tutorial/', "TUTORIAL");
	loadLyricsData('./resources/tutorial/', "TUTORIAL");
	currentStateStore.currentSongId = "TUTORIAL";
	audio.load();
	audio.addEventListener('loadedmetadata',
			function() {
				currentStateStore.trackDuration = document
						.getElementById('audio').duration * 100;
			});

	enableView("enableUploadView", "fileUploadHolder");
	currentStateStore.currentLyricView = "WORD_VIEW";

}

function loadATrack(selectedValue) {
	console.log("SelectedValue:" + selectedValue);
	var audio = document.getElementById('audio');
	audio.src = mp3Location + selectedValue + ".MP3";
	loadWaveForm('./resources/wavForm/', selectedValue);
	loadLyricsData('./resources/mp3MetaData/', selectedValue);
	currentStateStore.currentSongId = selectedValue;
	audio.load();
	audio.addEventListener('loadedmetadata',
			function() {
				currentStateStore.trackDuration = document
						.getElementById('audio').duration * 100;
			});

	$('#lyricText').hide();
	$('#lyrics').show();
	currentStateStore.currentLyricView = "WORD_VIEW";
}

function fileSaver(fileName, textContent) {
	var blob = new Blob([ textContent ], {
		type : "application/json;charset=utf-8"
	});
	// saveAs(blob, fileName + ".json");
	createZipFile(theCurrentMusicFile, blob)
}

function readZipFile(file) {
	JSZip.loadAsync(file).then(function(zip) {
		return zip.file("lyricData/LyricRecorder.js").async("text");
	}).then(function(txt) {
		var trackMetaData = JSON.parse(txt);
		processAJSONFile(trackMetaData);
	});
	
	
	JSZip.loadAsync(file).then(function(zip) {
		
		return zip.file("audio/audio.mp3").async("blob");
	}).then(function(file) {
		
	
		console.log(file);
		
	
		var vid = document.getElementById("audio");
		vid.src = URL.createObjectURL(file);
		vid.load();
		theCurrentMusicFile = file;
	});
	
	
}

function createZipFile(audioFile, lyricRecorderFile) {
	var zip = new JSZip();
	zip.folder("audio");
	zip.folder("lyricData");
	zip.file("audio/" + "audio.mp3", audioFile);
	zip.file("lyricData/LyricRecorder.js", lyricRecorderFile);

	zip.generateAsync({
		type : "blob"
	}).then(function(content) {
		// see FileSaver.js
		saveAs(content, "LyricRecorder.zip");
	});
	console.log("Created Zip File");
}

function saveLyricsToBrowser(trackMetaData, songId) {
	console.log(trackMetaData);
	trackMetaData.lyricRecorderSynchronisedLyrics = currentStateStore.lineArray;
	// trackMetaData.videoSnapshot = generateSingleSnapshot();
	// trackMetaData.pages = currentStateStore.book.pages;
	var trackMetaDataAsString = JSON.stringify(trackMetaData, null, 2);
	fileSaver(songId, trackMetaDataAsString);
}

function generateVideo(trackMetaData, songId) {
	trackMetaData.lyricRecorderSynchronisedLyrics = currentStateStore.lineArray;

	trackMetaData.videoSnapshot = generateSingleSnapshot();
	trackMetaData.pages = currentStateStore.book.pages;
	var trackMetaDataAsString = JSON.stringify(trackMetaData, null, 2);
	saveLyricsToServer(trackMetaDataAsString, songId)
}

function saveLyricsToServer(JSONFormattedLyricData, songId) {
	$.ajax({
		type : 'POST',
		url : './VideoDataUploadServlet',
		data : {
			"JSONFormattedLyricData" : JSONFormattedLyricData,
			"songId" : songId
		},
		success : function(text) {
			successfullySavedLyrics(text);
		},
		error : function(xhr) {
			alert("An error occured: " + xhr.status + " " + xhr.statusText);
		}
	});
	function successfullySavedLyrics(mp3MetaData1) {
		console.log(mp3MetaData1);
	}
}

function loadWaveForm(location, wavFormFile) {
	$.ajax({
		type : 'GET',
		url : location + wavFormFile + '.TXT',
		data : null,
		success : function(text) {
			processResponse(text);
		}
	});
	function processResponse(text) {
		lyricTracker.generateWaveForm(text);
	}
}

function loadWaveForm2(location, wavFormFile) {
	console.log("loadWaveForm2");
	$.ajax({
		type : 'GET',
		url : location + wavFormFile + '.TXT',
		data : null,
		success : function(text) {
			processResponse(text);
		}
	});
	function processResponse(text) {
		parameterWavePoints = waveFormTextToArray1(text);
		console.log(parameterWavePoints.length);
	}
}

var parameterWavePoints;

function waveFormTextToArray1(waveFormText) {
	waveFormText = waveFormText.replace(/\\r\\n/g, '\n');
	var tempLines = waveFormText.split('\n');
	var wp = 0;
	var wavePoints = [];
	var time, yHigh, yLow;

	for (var i = 0; i < tempLines.length; i++) {
		time = ((tempLines[i].split(',')[0]));
		yLow = ((tempLines[i].split(',')[1]));
		yHigh = ((tempLines[i].split(',')[2]));
		wavePoints[wp++] = new WavePoint1(time, yLow, yHigh);
	}
	return wavePoints;
}
function WavePoint1(time, yLow, yHigh) {
	this.time = time;
	this.yHigh = yHigh;
	this.yLow = yLow;
}

function loadLyricsData(location, wavFormFile) {
	$.ajax({
		type : 'GET',
		url : location + wavFormFile + '.json',
		data : null,
		cache : false,
		success : function(text) {

			generateLyricData(text);
		},
		error : function(xhr) {
			// alert("An error occured: " + xhr.status + " " + xhr.statusText);
			generateLyricData("");
		}
	});
	function generateLyricData(trackMetaData) {
		console.log("Hoopla:" + trackMetaData)
		if (trackMetaData.lyricRecorderSynchronisedLyrics
				&& trackMetaData.lyricRecorderSynchronisedLyrics != "") {
			console.log("loading synchronised lyrics");

			// loadMetaData(trackMetaData);

			try {
				updatePageDetails(trackMetaData);
				currentStateStore.trackMetaData = trackMetaData;
				currentStateStore.lineArray = JSON
						.parse(trackMetaData.lyricRecorderSynchronisedLyrics);
				$('#lyrics').html(generateLyrics(currentStateStore.lineArray));
				addClickToLyrics();
			} catch (e) {
				console.log("Error loading synchronised lyrics");
				convertTextToLyrics("Please enter some lyrics here ...");
				// $('#fileUploadHolder').addClass('viewContainer');
				enableView("enableTextView", "lyricText");
			}
		} else if (trackMetaData.unsynchronisedLyrics != "") {
			console.log("loading unsycnhronised lyrics");
			convertTextToLyrics("Please enter some lyrics here ...");
			// $('#fileUploadHolder').addClass('viewContainer');
			enableView("enableTextView", "lyricText");
		} else {
			console.log("No lyrics found");
			currentStateStore.trackMetaData = trackMetaData;
			convertTextToLyrics("Please enter some lyrics here ...");
			// $('#fileUploadHolder').addClass('viewContainer');
			enableView("enableTextView", "lyricText");
		}
	}
}
