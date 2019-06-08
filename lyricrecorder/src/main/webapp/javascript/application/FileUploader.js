var FileUploader = function(container) {
	this.bindEvents(container, this);
};

FileUploader.prototype.bindEvents = function(container, theFileUploader) {
	container.ondragover = function(e) {
		e.preventDefault();
		$(this).addClass('hover');
		return false;
	};
	container.ondragend = function(e) {
		e.preventDefault();
		$(this).removeClass('hover');
		return false;
	};
	container.ondragleave = function(e) {
		e.preventDefault();
		$(this).removeClass('hover');
		return false;
	};
	container.ondrop = function(e) {
		e.preventDefault();
		$(this).removeClass('hover');
		theFileUploader.readFiles(e.dataTransfer.files);
	}
}

var theCurrentMusicFile;

FileUploader.prototype.readFiles = function(files) {
	clearConsole();
	var formData = new FormData();
	var file;
	for (var i = 0; i < files.length; i++) {
		file = files[i]
		if (i == 0) { // only allow 1 file at a time
			if (file.type.split("/")[0] === "audio") { //If it's an audio file
				if (file.size < (20 * 1024 * 1024)) {
					formData.append('file', file);
					updateConsole('<p>* Reading file: ' + file.name + '</p>');
					performUpload(formData);
					var vid = document.getElementById("audio");
					vid.src = URL.createObjectURL(file);
					vid.load();
					theCurrentMusicFile = file;

				} else {
					updateConsole("<p class='bad'>* The maximum file size is 15 Mb.  This file is: '+ parseFloat((file.size / 1024 / 1024)).toFixed(2) + ' Mb</p>");
				}
			} else if (file.name.split(".")[1].toUpperCase() == "JSON") { //If it's a json file
				var reader = new FileReader();
				reader.onload = function(e) {
					var trackMetaData = JSON.parse(reader.result);
					processAJSONFile(trackMetaData);
				}
				reader.readAsText(file, "utf-8");
			} else if (file.type.split("/")[0].toUpperCase() == "APPLICATION") { //If it's a zip file
				readZipFile(file)
				
			}

			else {
				updateConsole("<p class='bad'>* This is not an audio file: <i>"
						+ file.name + "</i>.  File Type: \""
						+ file.type.split("/")[0]
						+ "\".  Please try again..</p>");
			}
		}
	}

	function performUpload(formData) {
		var conversionProgress = 0;
		var conversionIntervalFunction;
		updateConsole('<p id=\'fileUploadProgress\'>* Step 1/3 Uploading file to server 0%</p>');
		var xhr = new XMLHttpRequest();
		xhr.open('POST', './FileUpload');
		
		console.log("Hello Alex");
		
		xhr.onload = function(progressEvent) {
			// progress.value = progress.innerHTML = 100;
			var fileConversionProgress = document
					.getElementById('fileConversionProgress');
			fileConversionProgress.innerHTML = "* Step 2/3 Converting file 100%";
			window.clearInterval(conversionIntervalFunction);
			conversionProgress = 0;
			updateConsole('<p>* Step 3/3 Downloading file and preparing interface</p>');
			if (progressEvent.target.response == "ERROR") {
				console.log("Some sort of error occurred");
				updateConsole("<p class='bad'>* An error occurred during the conversion process</p>");
			} else {
				console.log("Hello:" + progressEvent.target.response);

				var json = JSON.parse(progressEvent.target.response);
				processANewlyUploadedMusicFile(json)
			}
		};

		xhr.onerror = function(event) {
			console.log('<p class=\'bad\'>* An error occurred with the upload. Please try again. '+xhr.responseText+'</p>');
		};

		xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
				var complete = (event.loaded / event.total * 100 | 0);
				var holder = document.getElementById('fileUploadProgress');
				holder.innerHTML = "* Step 1/3 Uploading file to server "
						+ complete + "%";
				if (complete == 100) {
					updateConsole('<p id=\'fileConversionProgress\'>* Step 2/3 Converting file 0%</p>');
					conversionIntervalFunction = setInterval(
							function() {
								var fileConversionProgress = document
										.getElementById('fileConversionProgress');
								conversionProgress += 1;
								fileConversionProgress.innerHTML = "* Step 2/3 Converting file "
										+ conversionProgress + "%";
								if (conversionProgress >= 100) {
									window
											.clearInterval(conversionIntervalFunction);
								}
							}, 100);
				}
			}
		}
		formData.append('userId', 'hawkesa');
		xhr.send(formData);
	}

}

function processANewlyUploadedMusicFile(json) {
	resetStuff();
	currentStateStore.trackMetaData = json;
	currentStateStore.currentSongId = json.uniqueId;
	updateConsole('<p>* Processing  ...</p>');
	setTimeout(
			function() {
				updatePageDetails(json);
				loadATrack2(json.uniqueId);
				loadMetaData(json);

				lyricTracker.generateWaveForm(json.coordinates);

				updateConsole("<p class='good'>* Processing complete.  Drag another audio file here to start again on a new track.</p>");
				// loadDefaultParametersFromFile(videoScript);
				enableView("enableTextView", "lyricText");
			}, currentStateStore.ECLIPSE_FILE_WAIT);

}

function processANewlyUploadedMusicFile1(json) {
	resetStuff();
	currentStateStore.trackMetaData = json;
	currentStateStore.currentSongId = json.uniqueId;
	updateConsole('<p>* Processing  ...</p>');
	setTimeout(
			function() {
				updatePageDetails(json);
				loadATrack2(json.uniqueId);
				loadMetaData(json);
				updateConsole("<p class='good'>* Processing complete.  Drag another audio file here to start again on a new track.</p>");
				loadDefaultParametersFromFile(videoScript);
				enableView("enableTextView", "lyricText");
			}, currentStateStore.ECLIPSE_FILE_WAIT);

}

function processAJSONFile(trackMetaData) {
	resetStuff();
	currentStateStore.trackMetaData = trackMetaData;
	var uniqueId = trackMetaData.uniqueId;
	currentStateStore.currentSongId = uniqueId;

	console.log("uniqueId="+trackMetaData);
	loadMetaData(trackMetaData);

	console.log("aaaaassss");
	lyricTracker.generateWaveForm(trackMetaData.coordinates)

	
	$('#lyrics').html(generateLyrics(currentStateStore.lineArray));
	 addClickToLyrics();
	enableView("enableWordView", "lyrics");
}

function loadMetaData(trackMetaData) {
	updatePageDetails(trackMetaData);
	currentStateStore.trackMetaData = trackMetaData;
	currentStateStore.lineArray = trackMetaData.lyricRecorderSynchronisedLyrics;
	
	

}
function resetStuff() {
	currentStateStore = new CurrentStateStore();
}

function loadATrack2(selectedValue) {
	var audio = document.getElementById('audio');
	// audio.src = mp3Location + selectedValue + ".MP3";

	// loadWaveForm('./resources/wavForm/', selectedValue);

	currentStateStore.currentSongId = selectedValue;
	audio.load();
	audio.addEventListener('loadedmetadata',
			function() {
				currentStateStore.trackDuration = document
						.getElementById('audio').duration * 100;
			});
}
