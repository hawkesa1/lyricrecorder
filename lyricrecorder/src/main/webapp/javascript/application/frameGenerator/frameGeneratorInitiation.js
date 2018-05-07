var canvas;
var ctx;
var dataURL;
var totalFrames = 100;
var a;

var lyricsObject;
var frameNumber;
var fps;
var pageWidth;
var pageHeight;
var tempFrame = 1;
var start = null;

function alex() {
	frameNumber++;
	drawIt1(ctx, (frameNumber / fps) * 1000);
	return frameNumber;
}


function addEventsToFrameInputs() {
	$(function() {
		$("#frameRange").change(function(event) {
			frameNumber = $("#frameRange").val();
			$("#frameValue").val(frameNumber);
			drawIt1(ctx, (frameNumber / fps) * 1000);
		});
	});

	$(function() {
		$("#frameValue").change(function(event) {
			frameNumber = $("#frameValue").val();
			$("#frameRange").val(frameNumber);
			drawIt1(ctx, (frameNumber / fps) * 1000);
		});
	});
	$(function() {
		$("#displayFrame").click(function(event) {
			frameNumber = $("#frameValue").val();
			$("#frameRange").val(frameNumber);
			
			var t0 = performance.now();
			drawIt1(ctx, (frameNumber / fps) * 1000);
			var t1 = performance.now();
			console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
			
			
		});
	});
}

var QueryString = function() {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], decodeURIComponent(pair[1]) ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();


