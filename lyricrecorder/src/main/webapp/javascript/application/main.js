var waveForm;
var mp3Location = "./resources/convertedMp3/";
var downloadableMp3Location = "./resources/downloadableMp3/";

function CurrentStateStore()
{
	this.onlyWordsArray = new Array();
	this.lineArray = new Array();
	this.stopAtTime;
	this.currentSongId;
	this.currentSelectedWordId = "";
	this.currentSelectedWord;
	this.currentSelectedWordNextWord = null;
	this.currentSelectedWordPreviousWord = null;
	this.currentPlayingWordId = "";
	this.currentHoveredWordId = "";
	this.currentDoubleClickedWordId = "";
	this.currentPlayingWord;
	this.currentLineIndex = 0;
	this.currentWordIndex = 0;
	this.currentLyricView = "";
	this.currentlyAddingWord = false;
	this.markerWordAtTheEnd; 
	this.ECLIPSE_FILE_WAIT = 0;
	this.trackDuration = 0;
	this.nextWordToAddId = "";
	this.highestEndTime = 0;
	this.lastAddedWordId = "";
	this.lyricMetaData = "";
	this.book=new Object();
	this.book.pages=new Array();
}



function animate() {
	requestAnimationFrame(animate);
	draw();
}

function draw() {
	lyricTracker.canvas.context.clearRect(0, 0, lyricTracker.canvas.width, lyricTracker.canvas.height);
	waveForm.draw($("#audio").prop("currentTime") * 1000, lyricTracker.canvas.context);
	
	drawIt1(videoContext, $("#audio").prop("currentTime") * 1000)
}
