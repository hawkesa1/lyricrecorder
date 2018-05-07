var time0l = 0;
var time02 = 0;
var frameCounter = 0;
var fps = 0;

function drawIt1(ctx3, currentAudioTime) {
	if (needToReCalculatePages) {
		generateNewPages();
		needToReCalculatePages = false;
	}

	clearContexts(ctx3);
	setBackgroundSettings(ctx3);
	drawPages(ctx3, currentAudioTime);

	frameCounter++;

	if (frameCounter % 100 == 0) {
		time02 = performance.now();
		fps = Math.round((100 / (time02 - time0l)) * 1000);
		console.log(fps + " FPS");
		frameCounter = 0;
		time0l = performance.now();
	}
}

function clearContexts(ctx3) {
	ctx3.clearRect(0, 0, ctx3.canvas.clientWidth, ctx3.canvas.clientHeight);
	word1Context.clearRect(0, 0, word1Context.canvas.clientWidth,
			word1Context.canvas.clientHeight);
	word2Context.clearRect(0, 0, word1Context.canvas.clientWidth,
			word1Context.canvas.clientHeight);

}
var markerSize = 0;
var currentWholeUnitTime = 0;
var currentYHigh = 0;

function drawPages(ctx3, currentAudioTime) {
	ctx3.save();
	ctx3.globalAlpha = parameterValues.backgroundOpacity;
	ctx3.fillStyle = parameterValues.textBackgroundColour;
	if (parameterValues.backgroundShadowShow) {
		ctx3.shadowColor = parameterValues.backgroundShadowColour;
		ctx3.shadowOffsetX = parameterValues.backgroundShadowOffsetX;
		ctx3.shadowOffsetY = parameterValues.backgroundShadowOffsetY;
		ctx3.shadowBlur = parameterValues.backgroundShadowBlur;
	}
	ctx3.fillRect(parameterValues.textX, parameterValues.textY - 40,
			parameterValues.textWidth, parameterValues.textHeight);
	ctx3.restore();

	var aPage;
	var drawingAPage = false;
	outer_loop: for (var i = 0; i < currentStateStore.book.pages.length; i++) {
		// console.log("Drawing linezzzz:" + i);
		aPage = currentStateStore.book.pages[i];
		if (aPage.startTime < currentAudioTime
				&& aPage.endTime > currentAudioTime) {
			drawingAPage = true;
			drawPage(ctx3, currentAudioTime, aPage, 0);
			break outer_loop;
		} else if (aPage.startTime > currentAudioTime) {
			break outer_loop;
		}
	}
	if (!drawingAPage) {
		if (circ) {
			circ.css({
				'display' : 'none',
			});
		}
		var nextPage = 0;
		var timeTilNextPage = 0;
		var loopCount = 0;
		outer_loop: for (var i = 0; i < currentStateStore.book.pages.length; i++) {
			aPage = currentStateStore.book.pages[i];
			if (i == 0 && aPage.startTime > currentAudioTime) {
				// Before First Page
				timeTilNextPage = aPage.startTime - currentAudioTime;
				nextPage = i;
				break outer_loop;
			} else if (aPage.startTime < currentAudioTime
					&& currentStateStore.book.pages[i + 1].startTime > currentAudioTime) {
				// Before a page
				nextPage = i + 1;
				timeTilNextPage = currentStateStore.book.pages[i + 1].startTime
						- currentAudioTime;
				break outer_loop;
			} else if (i + 1 == currentStateStore.book.pages.length
					&& aPage.endTime < currentAudioTime) {
				// After last page
				break outer_loop;
			}
		}
		if (timeTilNextPage <= parseInt(parameterValues.pageFlyInDuration)) {
			drawPage(ctx3, currentAudioTime,
					currentStateStore.book.pages[nextPage], timeTilNextPage);
		}

	}
}

function drawPage(ctx3, currentAudioTime, aPage, timeTilNextPage) {
	if (timeTilNextPage > 0) {
		flyInPosition = $.easing[parameterValues.pageEasingFunction](0, timeTilNextPage, 0, parseInt(parameterValues.pageFlyInStartValue),
				parseInt(parameterValues.pageFlyInDuration));

		// flyInPosition = timeTilNextPage;
	} else {
		flyInPosition = 0;
	}
	var aLineYPosition = parameterValues.textY - 0;
	wigglePosition = Math.sin((currentAudioTime / 500)) * 5;
	var isCurrentLine = false;
	if (!aPage) {
		return false;
	}
	for (var i = 0; i < aPage.lines.length; i++) {
		if (i != 0) {
			aLineYPosition += (parameterValues.newLineSpacing - 0);
		}
		if (aPage.lines[i].startTime > currentAudioTime
				&& aPage.lines[i].endTime < currentAudioTime) {
			isCurrentLine = true;
		}
		aLineYPosition = drawALine(ctx3, currentAudioTime, aPage.lines[i],
				aLineYPosition, isCurrentLine);
	}
	if (parameterValues.showMarker) {
		drawLittleCircle(ctx3, littleCircleX, littleCircleY, 10,
				currentAudioTime);
	} else {
		if (circ) {
			circ.css({
				'display' : 'none',
			});
		}
	}
}

function drawALine(ctx3, currentAudioTime, lineNumber, aLineYPosition,
		isCurrentLine) {
	var aLine = currentStateStore.lineArray[lineNumber];
	aLineYPosition = drawLine(ctx3, currentAudioTime, aLine, aLineYPosition,
			isCurrentLine);
	return aLineYPosition;
}

var wigglePosition = 0;
var flyInPosition = 0;

function drawLine(ctx3, currentAudioTime, aLine, thisLineYPosition,
		isCurrentLine) {
	var currentLineWidth = 0;
	var aWord;
	var xPosition = parameterValues.textX - 0 + 10;
	var yPosition = thisLineYPosition;
	yPosition += flyInPosition;
	xPosition += wigglePosition;

	var wordWidth = 0;
	var wordSpace = 0;
	var wordWidth1 = 0;
	var areWeDrawing = false;
	// for each word
	for (var j = 0; j < aLine.words.length; j++) {
		aWord = aLine.words[j];

		var fontString = parameterValues.fontStyle + " "
				+ parameterValues.fontVariant + " "
				+ parameterValues.fontWeight + " " + parameterValues.fontSize
				+ "px " + parameterValues.fontFamily;
		ctx3.font = parameterValues.fontStyle + " "
				+ parameterValues.fontVariant + " "
				+ parameterValues.fontWeight + " " + parameterValues.fontSize
				+ "px " + parameterValues.fontFamily;
		// add this word to the current line and measure the width
		currentLineWidth += ctx3.measureText(aWord.word).width;

		// if the line width is wider than desired, start a new line
		if (currentLineWidth >= (parameterValues.textWidth)) {
			currentLineWidth = ctx3.measureText(aWord.word).width
					+ (parameterValues.characterSpacing - 0);
			xPosition = (parameterValues.textX - 0 + 10);
			xPosition += wigglePosition;
			// yPosition += flyInPosition;
			yPosition = yPosition + (parameterValues.lineHeight - 0);
		} else {
			currentLineWidth += (parameterValues.characterSpacing - 0);
		}
		// if this is the current word
		if (aWord.startTime < currentAudioTime
				&& aWord.endTime > currentAudioTime) {
			xPosition = drawSelectedText(aWord, currentAudioTime, ctx3,
					xPosition, yPosition);
			areWeDrawing = true;
		} else {
			xPosition = drawUnselectedText(aWord, currentAudioTime, ctx3,
					xPosition, yPosition);
		}
	}
	if (isCurrentLine) {

	}
	return thisLineYPosition;
}

var littleCircleX = 0;
var littleCircleY = 0;

function drawCoveredWord(aWord, xPosition, yPosition, selectedFontSize,
		theWordWidth, currentAudioTime) {

	var percentComplete = (currentAudioTime - aWord.startTime)
			/ (aWord.endTime - aWord.startTime);

	var bx = (xPosition - 10);
	var by = (yPosition - selectedFontSize);
	var bw = ((theWordWidth * percentComplete) + 10);
	var bh = (selectedFontSize + 200);

	littleCircleX = bx + bw;
	littleCircleY = by;

	if (parameterValues.graduatedWordType == 'off') {
		if (parameterValues.graduatedShadowShow) {
			word1Context.shadowColor = parameterValues.selectedShadowColour;
			word1Context.shadowOffsetX = parameterValues.selectedShadowOffsetX;
			word1Context.shadowOffsetY = parameterValues.selectedShadowOffsetY;
			word1Context.shadowBlur = parameterValues.selectedShadowBlur;
		}
		word1Context.textBaseline = 'alphabetic';
		word1Context.fillStyle = parameterValues.selectedFontColour;
		word1Context.globalAlpha = parameterValues.selectedWordOpacity;
		word1Context.font = parameterValues.fontStyle + " "
				+ parameterValues.fontVariant + " "
				+ parameterValues.fontWeight + " " + selectedFontSize + "px "
				+ parameterValues.fontFamily;
		;
		word1Context.fillText(aWord.word, xPosition, yPosition);
		word1Context.restore();
	} else {

		word1Context.save();
		word1Context.strokeStyle = 'rgba(30,144,255,0)';
		word1Context.beginPath();

		word2Context.save();
		word2Context.strokeStyle = 'rgba(255,69,0,0)';
		word2Context.beginPath();

		if (parameterValues.graduatedWordType == 'horizontal') {
			var graduatedYPosition = ((yPosition - selectedFontSize + 20) + (selectedFontSize - (selectedFontSize)
					* percentComplete));
			word1Context.rect(xPosition, graduatedYPosition, theWordWidth,
					selectedFontSize * percentComplete);
		} else if (parameterValues.graduatedWordType == 'vertical') {
			word1Context.rect(bx, by, bw, bh);
			word2Context.rect((bx + bw) +0, by, (theWordWidth - bw) + 100, bh);
			word1Context.stroke();
			word1Context.clip();
			word1Context.closePath();
			word2Context.stroke();
			word2Context.clip();
			word2Context.closePath();
			if (parameterValues.graduatedShadowShow) {
				word1Context.shadowColor = parameterValues.graduatedShadowColour;
				word1Context.shadowOffsetX = parameterValues.graduatedShadowOffsetX;
				word1Context.shadowOffsetY = parameterValues.graduatedShadowOffsetY;
				word1Context.shadowBlur = parameterValues.graduatedShadowBlur;
			}
			word1Context.textBaseline = 'alphabetic';
			word1Context.fillStyle = parameterValues.graduatedWordColour;
			word1Context.globalAlpha = parameterValues.graduatedWordOpacity;
			word1Context.font = parameterValues.fontStyle + " "
					+ parameterValues.fontVariant + " "
					+ parameterValues.fontWeight + " " + selectedFontSize
					+ "px " + parameterValues.fontFamily;
			word1Context.fillText(aWord.word, xPosition, yPosition);
			word1Context.restore();
			if (parameterValues.unselectedShadowShowFuture) {
				word2Context.shadowColor = parameterValues.unselectedShadowColourFuture;
				word2Context.shadowOffsetX = parameterValues.unselectedShadowOffsetXFuture;
				word2Context.shadowOffsetY = parameterValues.unselectedShadowOffsetYFuture;
				word2Context.shadowBlur = parameterValues.unselectedShadowBlurFuture;
			}
			word2Context.textBaseline = 'alphabetic';
			word2Context.globalAlpha = parameterValues.unselectedOpacityFuture;
			word2Context.fillStyle = parameterValues.unselectedFontColourFuture;
			word2Context.font = parameterValues.fontStyle + " "
					+ parameterValues.fontVariant + " "
					+ parameterValues.fontWeight + " " + selectedFontSize
					+ "px " + parameterValues.fontFamily;
			word2Context.fillText(aWord.word, xPosition, yPosition);
			word2Context.restore();

		}
	}

}

function drawLittleCircle(theContext, centerX, centerY, radius,
		currentAudioTime) {
	currentWholeUnitTime = parseInt(Math.ceil(currentAudioTime / 10));
	if (circ && parameterWavePoints) {
		currentYHigh = (parameterWavePoints[parseInt(currentWholeUnitTime)].yHigh) / 100;
		markerSize = parseInt(parameterValues.markerSize)
				+ (currentYHigh * parseInt(parameterValues.markerIncrease));
		circ.css({
			'width' : markerSize + 'px',
			'height' : markerSize + 'px'
		});
		var markerPosX = parseInt(parameterValues.markerLeft)
				- (((markerSize - parseInt(parameterValues.markerSize))) / 2);
		circ.css({
			'display' : 'block',
			'top' : parameterValues.markerTop + 'px',
			'left' : markerPosX + 'px',
			'opacity' : parameterValues.markerOpacity
		});
	}

	var hippoX = parseInt(centerX) + parseInt(parameterValues.markerTextLeft);
	var hippoY = parseInt(centerY) + parseInt(parameterValues.markerTextTop);
	mySVG.style.left = hippoX + "px";
	mySVG.style.top = hippoY + "px";
}

function drawUnselectedText(aWord, currentAudioTime, ctx3, xPosition, yPosition) {
	ctx3.save();
	if (aWord.startTime < currentAudioTime) {
		if (parameterValues.unselectedShadowShowPast) {
			ctx3.shadowColor = parameterValues.unselectedShadowColourPast;
			ctx3.shadowOffsetX = parameterValues.unselectedShadowOffsetXPast;
			ctx3.shadowOffsetY = parameterValues.unselectedShadowOffsetYPast;
			ctx3.shadowBlur = parameterValues.unselectedShadowBlurPast;
		}
		ctx3.font = parameterValues.fontStyle + " "
				+ parameterValues.fontVariant + " "
				+ parameterValues.fontWeight + " " + parameterValues.fontSize
				+ "px " + parameterValues.fontFamily;
		ctx3.textBaseline = 'alphabetic';
		ctx3.globalAlpha = parameterValues.unselectedOpacityPast;
		ctx3.fillStyle = parameterValues.unselectedFontColourPast;
		ctx3.fillText(aWord.word, xPosition, yPosition);
		ctx3.restore();
	} else {
		if (parameterValues.unselectedShadowShowFuture) {
			ctx3.shadowColor = parameterValues.unselectedShadowColourFuture;
			ctx3.shadowOffsetX = parameterValues.unselectedShadowOffsetXFuture;
			ctx3.shadowOffsetY = parameterValues.unselectedShadowOffsetYFuture;
			ctx3.shadowBlur = parameterValues.unselectedShadowBlurFuture;
		}
		ctx3.font = parameterValues.fontStyle + " "
				+ parameterValues.fontVariant + " "
				+ parameterValues.fontWeight + " " + parameterValues.fontSize
				+ "px " + parameterValues.fontFamily;
		ctx3.textBaseline = 'alphabetic';
		ctx3.globalAlpha = parameterValues.unselectedOpacityFuture;
		ctx3.fillStyle = parameterValues.unselectedFontColourFuture;
		ctx3.fillText(aWord.word, xPosition, yPosition);
		ctx3.restore();
	}
	xPosition = xPosition + ctx3.measureText(aWord.word).width
			+ (parameterValues.characterSpacing - 0);
	ctx3.restore();
	return xPosition;
}
var easingFunction = "easeOutBounce";

function drawSelectedText(aWord, currentAudioTime, ctx3, xPosition, yPosition) {
	ctx3.save();
	var wordWidth = ctx3.measureText(aWord.word).width;
	if (parameterValues.selectedShadowShow) {
		ctx3.shadowColor = parameterValues.selectedShadowColour;
		ctx3.shadowOffsetX = parameterValues.selectedShadowOffsetX;
		ctx3.shadowOffsetY = parameterValues.selectedShadowOffsetY;
		ctx3.shadowBlur = parameterValues.selectedShadowBlur;
	}
	ctx3.font = parameterValues.fontStyle + " " + parameterValues.fontVariant
			+ " " + parameterValues.fontWeight + " " + parameterValues.fontSize
			+ "px " + parameterValues.fontFamily;
	ctx3.textBaseline = 'alphabetic';
	ctx3.globalAlpha = parameterValues.selectedOpacity;
	ctx3.fillStyle = parameterValues.selectedFontColour;

	selectedFontSize = parseInt(parameterValues.fontSize) + 0;
	var easingAmount = 0;
	var endTimeA = (aWord.startTime - 0)
			+ (parameterValues.selectedEasingDuration - 0);

	if (currentAudioTime < endTimeA) {
		easingAmount = $.easing[parameterValues.selectedEasingFunction](0,
				(currentAudioTime - aWord.startTime), 0,
				parameterValues.fontSizeIncrease,
				parameterValues.selectedEasingDuration);
	} else {
		easingAmount = parameterValues.fontSizeIncrease - 0;
	}
	easingAmount = easingAmount || 0;

	selectedFontSize = selectedFontSize + easingAmount;
	ctx3.font = parameterValues.fontStyle + " " + parameterValues.fontVariant
			+ " " + parameterValues.fontWeight + " " + selectedFontSize + "px "
			+ parameterValues.fontFamily;
	wordSpace = ctx3.measureText(aWord.word).width - wordWidth;

	drawCoveredWord(aWord, (xPosition - (easingAmount / 4)),
			(yPosition + (easingAmount / 4)), selectedFontSize, ctx3
					.measureText(aWord.word).width, currentAudioTime);

	xPosition = xPosition + ctx3.measureText(aWord.word).width
			+ ((parameterValues.characterSpacing - 0) - wordSpace);

	ctx3.restore();
	return xPosition;
}

var temporaryBackgroundValues = {}

function hasValueChanged(valueName) {
	if (temporaryBackgroundValues[valueName] != parameterValues[valueName]) {
		// console.log(valueName + " has changed"
		// + temporaryBackgroundValues[valueName] + ":"
		// + parameterValues[valueName]);
		// temporaryBackgroundValues[valueName] = parameterValues[valueName];

		return true;
	} else {
		// console.log(valueName + " has not changed");
		return false;
	}
}

function setBackgroundSettings() {
	if (hasValueChanged("backgroundImageRotation")) {
		setBackgroundImageRotation(parameterValues.backgroundImageRotation);
	}

	if (hasValueChanged("backgroundRepeat")) {
		setBackgroundImageRepeat(parameterValues.backgroundRepeat);
	}
	if (hasValueChanged("backgroundContainerWidth")
			|| hasValueChanged("backgroundContainerHeight")) {
		setBackgroundContainerSize(parameterValues.backgroundContainerWidth,
				parameterValues.backgroundContainerHeight);
	}
	if (hasValueChanged("backgroundImageWidth")
			|| hasValueChanged("backgroundImageHeight")) {
		setBackgroundImageSize(parameterValues.backgroundImageHeight,
				parameterValues.backgroundImageWidth);
	}
	if (hasValueChanged("backgroundImagePositionX")
			|| hasValueChanged("backgroundImagePositionY")) {
		setBackgroundImagePosition(parameterValues.backgroundImagePositionX,
				parameterValues.backgroundImagePositionY);
	}
	if (hasValueChanged("backgroundContainerPositionX")
			|| hasValueChanged("backgroundImagePositionY")) {
		setBackgroundContainerPosition(
				parameterValues.backgroundContainerPositionY,
				parameterValues.backgroundContainerPositionX)
	}
	if (hasValueChanged("backgroundColour")) {
		setBackgroundColour(parameterValues.backgroundColour);
	}
}

function setBackgroundImageSize(width, height) {
	$("#backgroundImageContainer").css("background-size",
			height + "px " + width + "px");
}

function setBackgroundContainerPosition(top, left) {
	$("#backgroundImageContainer").css("top", top + "px");
	$("#backgroundImageContainer").css("left", left + "px");
}
function setBackgroundContainerSize(width, height) {
	$("#backgroundImageContainer").width(width + "px");
	$("#backgroundImageContainer").height(height + "px");
}

function setBackgroundImagePosition(x, y) {
	$("#backgroundImageContainer").css("background-position",
			x + "px " + y + "px");
}
function setBackgroundColour(backgroundColour) {
	$("#backgroundImageContainer").css("background-color", backgroundColour);

}

function setBackgroundImageRepeat(backgroundRepeat) {
	$("#backgroundImageContainer").css("background-repeat", backgroundRepeat);
}

function setBackgroundImageRotation(rotiationInDegrees) {
	$('#backgroundImageContainer').css({
		'-webkit-transform' : 'rotate(' + rotiationInDegrees + 'deg)',
		'-moz-transform' : 'rotate(' + rotiationInDegrees + 'deg)',
		'-ms-transform' : 'rotate(' + rotiationInDegrees + 'deg)',
		'transform' : 'rotate(' + rotiationInDegrees + 'deg)',
		'-ms-transform-origin' : '400px 300px',
		'-webkit-transform-origin' : '400px 300px',
		'transform-origin' : '400px 300px'
	});
}