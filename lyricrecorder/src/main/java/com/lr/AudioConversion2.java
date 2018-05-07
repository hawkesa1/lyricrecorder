package com.lr;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.util.Vector;

import javax.sound.sampled.UnsupportedAudioFileException;

import org.apache.commons.io.FileUtils;
import org.mp3transform.wav.AudioWaveFormCreator2;
import org.mp3transform.wav.Coordinate;

public class AudioConversion2 {

	private static final int MAXIMUM_WAIT_TIME_IN_SECONDS = 10;

	public static void main(String args[]) throws IOException, UnsupportedAudioFileException, InterruptedException {
		AudioConversion2 audioConversion2 = new AudioConversion2();
		audioConversion2.runIt("song", "m4a", "C:\\Users\\Hawkes\\2016WorkSpace\\lyricrecorder\\WebContent\\resources");
	}
	
	public Vector<Coordinate> processFile(String audioFileName, String sourceAudioFileExtension,
			String resourcesFolder) throws Exception {
		return runIt(audioFileName, sourceAudioFileExtension, resourcesFolder);
	}

	private Vector<Coordinate> runIt(String fileName, String fileExtension, String resourcesLocation)
			throws IOException, UnsupportedAudioFileException, InterruptedException {

		String FFMPEG_BINARY_1 = resourcesLocation + "\\ffmpeg\\ffmpeg.exe";
		String SWITCH_PROCESS = resourcesLocation + "\\switchProcessing\\";
		String SWITCH_PROCESS_QUEUE_1 = SWITCH_PROCESS + "\\1-queued\\";
		String SWITCH_PROCESS_WAV_1 = SWITCH_PROCESS + "\\2-wav\\";
		String SWITCH_PROCESS_MP3_1 = SWITCH_PROCESS + "\\3-mp3\\";
		String COMMAND_STUB_1 = "cmd /c start " + resourcesLocation + "\\scripts\\audioConvert1_ffmpeg.bat ";
		String COMMAND_STUB_2 = "cmd /c start " + resourcesLocation + "\\scripts\\audioConvert2_ffmpeg.bat ";
		String WAV_COORDINATES_1 = resourcesLocation + "\\wavForm\\";
		String CONVERTED_MP3_1 = resourcesLocation + "\\convertedMp3\\";
		String ORIGINAL_UPLOAD_1 = resourcesLocation + "\\originalUpload\\";

		// Copy the original upload to the queue directory
		FileUtils.copyFile(new File(ORIGINAL_UPLOAD_1 + fileName + "." + fileExtension),
				new File(SWITCH_PROCESS_QUEUE_1 + fileName + "." + fileExtension));

		// Wait for the copy to complete
		// File genertaedWavFile = getNewFile(SWITCH_PROCESS_QUEUE_1 + fileName
		// + "." + fileExtension);

		// Convert source file to WAV
		convertAudioFileToWav1(COMMAND_STUB_1, FFMPEG_BINARY_1, SWITCH_PROCESS_QUEUE_1 + fileName + "." + fileExtension,
				SWITCH_PROCESS_WAV_1 + fileName + ".WAV");

		// Generate Vector of the wav points
		Vector<Coordinate> wavPoints = generateWaveCoordinatesFromWavFile(
				new File(SWITCH_PROCESS_WAV_1 + fileName + ".WAV"));

		// Save the wav points in a file
		writeCoordinatesToFile(WAV_COORDINATES_1 + "\\" + fileName + ".TXT", wavPoints);

		// Delete the wav file
		deleteFile(new File(SWITCH_PROCESS_WAV_1 + fileName + ".WAV"));

		// Convert the source file to an MP3
		convertWAVFileToMP31(COMMAND_STUB_2, FFMPEG_BINARY_1, SWITCH_PROCESS_QUEUE_1 + fileName + "." + fileExtension,
				SWITCH_PROCESS_MP3_1 +  fileName + ".MP3");

		// Move the generated mp3 to the generated mp3 directory
		FileUtils.moveFile(new File(SWITCH_PROCESS_MP3_1 + fileName + ".MP3"),
				new File(CONVERTED_MP3_1 + fileName + ".MP3"));

		// Delete the queued file
		deleteFile(new File(SWITCH_PROCESS_QUEUE_1 + fileName + "." + fileExtension));
		
		return wavPoints;

	}

	private void convertAudioFileToWav1(String commandStub, String audioConvertExecutable,
			String sourceAudioFilePathAndName, String targetAudioFilePathAndName) throws IOException {

		String command = commandStub + " \"" + audioConvertExecutable + "\" \"" + sourceAudioFilePathAndName + "\" \""
				+ targetAudioFilePathAndName + "\"";

		runBatchFile1(command);
	}

	private void convertWAVFileToMP31(String commandStub, String audioConvertExecutable,
			String sourceAudioFilePathAndName, String targetAudioFilePathAndName) throws IOException {
		String command = commandStub + " \"" + audioConvertExecutable + "\" \"" + sourceAudioFilePathAndName + "\" \""
				+ targetAudioFilePathAndName + "\"";

		runBatchFile1(command);
	}

	private void runBatchFile1(String command) throws IOException {
		System.out.println(command);
		Process p = Runtime.getRuntime().exec(command);
		BufferedReader stdOut = new BufferedReader(new InputStreamReader(p.getInputStream()));
		String s;
		while ((s = stdOut.readLine()) != null) {
			// nothing or print
		}
		System.out.println("Done It");
	}

	private void deleteFile(File file) throws IOException, InterruptedException {
		long startTime = System.currentTimeMillis();
		long elapsedTime = -1;
		while (!file.renameTo(file)) {
			// Cannot read from file, windows still working on it.
			Thread.sleep(100);
			elapsedTime = (System.currentTimeMillis() - startTime) / 1000;
			System.out.println("Deleting file: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
			if (elapsedTime > MAXIMUM_WAIT_TIME_IN_SECONDS) {
				System.out.println(
						"File took too long to delete: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
				break;
			}
		}
		Files.delete(file.toPath());
	}

	private Vector<Coordinate> generateWaveCoordinatesFromWavFile(File file)
			throws UnsupportedAudioFileException, IOException {
		AudioWaveFormCreator2 awc = new AudioWaveFormCreator2();
		int samplesPerSecond = 100;
		return awc.createWaveForm(file, samplesPerSecond);
	}

	private void writeCoordinatesToFile(String filePath, Vector<Coordinate> coordinates) throws IOException {
		Writer writer = null;
		try {
			writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filePath), "utf-8"));

			for (Coordinate coordinate : coordinates) {
				writer.write(
						coordinate.getX() + "," + coordinate.getY_min() + "," + coordinate.getY_max() + newLineChar);
			}
		} catch (IOException ex) {
			throw ex;
		} finally {
			try {
				writer.close();
			} catch (Exception ex) {
			}
		}
	}

	static final String newLineChar = System.getProperty("line.separator");
}
