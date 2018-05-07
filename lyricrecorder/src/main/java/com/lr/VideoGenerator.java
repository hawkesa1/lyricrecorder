package com.lr;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.crypto.Data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * @author Hawkes
 *
 */
public class VideoGenerator {

	private static String VIDEO_ROOT = "C:\\Users\\Hawkes\\GitRepoLyricVideo\\LyricVideo";
	private static String VIDEO_SCRIPT = VIDEO_ROOT + "\\videoGenerator\\generateVideo.bat";
	private static String COMMAND_STUB = "cmd /c start " + VIDEO_SCRIPT;
	private static String PHANTOM_BINARY = VIDEO_ROOT + "\\phantomJS\\phantomjs-2.1.1-windows\\bin\\phantomjs";
	private static String PHANTOM_SCRIPT = VIDEO_ROOT + "\\phantomJS\\phantomScripts\\takeLoadsOfScreenshots2.js";
	private static String GENERATED_FRAMES = "H:\\VideoRecorder\\frames\\render1\\";
	private static String FFMPEG_BINARY = VIDEO_ROOT + "\\ffmpeg\\ffmpeg\\bin\\ffmpeg";
	private static String VIDEO_SILENT = "H:\\VideoRecorder\\silentVideo";
	private static String MP3 = "C:\\Users\\Hawkes\\2016WorkSpace\\lyricrecorder\\WebContent\\resources\\convertedMp3\\";
	private static String VIDEO = "H:\\VideoRecorder\\video";
	private static String FIRST_FRAME;
	private static String LAST_FRAME;
	private static String WIDTH;
	private static String HEIGHT;
	private static String FPS;

	private void readAttributesFromJSON(String JSONFormattedLyricData) {
		JsonObject jobj = new Gson().fromJson(JSONFormattedLyricData, JsonObject.class);
		JsonElement el = jobj.get("videoSnapshot");
		JsonElement idElement = el.getAsJsonObject().get("snapshots");
		JsonArray idArray = idElement.getAsJsonArray();
		JsonElement parameterValues = idArray.get(0);
		JsonElement parameterValues1 = parameterValues.getAsJsonObject().get("parameterValues");

		WIDTH = parameterValues1.getAsJsonObject().get("videoWidth").getAsString();
		HEIGHT = parameterValues1.getAsJsonObject().get("videoHeight").getAsString();
		FPS = parameterValues1.getAsJsonObject().get("videoFPS").getAsString();
		FIRST_FRAME = parameterValues1.getAsJsonObject().get("videoFirstFrame").getAsString();
		LAST_FRAME = parameterValues1.getAsJsonObject().get("videoLastFrame").getAsString();
	}

	public void generateVideo(String songId, String pathToVideoScript, String jSONFormattedLyricData)
			throws IOException {
		String mp3File=MP3 + songId + ".MP3";
		System.out.println(mp3File);
		readAttributesFromJSON(jSONFormattedLyricData);
		songId += System.currentTimeMillis();
		generateVideo1(COMMAND_STUB, PHANTOM_BINARY, PHANTOM_SCRIPT, GENERATED_FRAMES, FFMPEG_BINARY,
				VIDEO_SILENT + "\\" + songId + "_silent.MP4", mp3File, VIDEO + "\\" + songId + ".MP4",
				FIRST_FRAME, LAST_FRAME, WIDTH, HEIGHT, FPS, pathToVideoScript);
	}

	private void generateVideo1(String commandStub, String phantomBinary, String phantomScript, String generatedFrames,
			String ffmpegBinary, String videoSilent, String mp3, String video, String firstFrame, String lastFrame,
			String width, String height, String FPS, String pathToVideoScript) throws IOException {

		String command = commandStub + " \"" + phantomBinary + "\" \"" + phantomScript + "\"" + " \"" + generatedFrames
				+ "\" \"" + ffmpegBinary + "\" \"" + videoSilent + "\" " + "\"" + mp3 + "\" \"" + video + "\" "
				+ firstFrame + " " + lastFrame + " " + width + " " + height + " " + FPS + " \"" + pathToVideoScript
				+ "\"";
		System.out.println(command);
		runBatchFile1(command);
	}

	private void runBatchFile1(String command) throws IOException {
		System.out.println(command);
		Process p = Runtime.getRuntime().exec(command);
		System.out.println("Done It");
	}

}
