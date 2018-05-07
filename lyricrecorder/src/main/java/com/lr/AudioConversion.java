package com.lr;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.util.Vector;

import javax.sound.sampled.UnsupportedAudioFileException;

import org.apache.commons.io.FileExistsException;
import org.apache.commons.io.FileUtils;
import org.jaudiotagger.audio.exceptions.CannotReadException;
import org.jaudiotagger.audio.exceptions.CannotWriteException;
import org.jaudiotagger.audio.exceptions.InvalidAudioFrameException;
import org.jaudiotagger.audio.exceptions.ReadOnlyFileException;
import org.jaudiotagger.tag.TagException;
import org.mp3transform.wav.AudioWaveFormCreator2;
import org.mp3transform.wav.Coordinate;

import com.lr.MP3MetaData;

public class AudioConversion {

	private String audioConvertExecutable = null;
	private String commandStub1 = null;
	private String commandStub2 = null;
	private String switchProcessRoot = null;
	private String switchProcessQueue = null;
	private String switchProcessWav = null;
	private String switchProcessMp3 = null;
	private String theOriginalUpload = null;
	private String convertedMP3 = null;
	private String wavCoordinates = null;
	private static final int MAXIMUM_WAIT_TIME_IN_SECONDS=10;

	public Vector<Coordinate> processFile(String audioFileName, String sourceAudioFileExtension, String resourcesFolder)
			throws Exception {

		//Set the folder locations
		setFolder(resourcesFolder);

		String targetWavFilePath = switchProcessWav + "\\" + audioFileName + ".WAV";
		Vector<Coordinate> waveCoordinates = null;

		File originalUpload = new File(theOriginalUpload + "\\" + audioFileName + "." + sourceAudioFileExtension);
		File queuedOriginalFormat = new File(
				switchProcessQueue + "\\" + audioFileName + "." + sourceAudioFileExtension);
		File convertedMp3 = new File(convertedMP3 + "\\" + audioFileName + "." + "MP3");
		// copy file from the original upload folder to the queue folder
		FileUtils.copyFile(originalUpload, queuedOriginalFormat);

		// Convert any audio format to a WAV file
		convertAudioFileToWav(queuedOriginalFormat.getAbsolutePath());
		// Wait until the WAV file is ready
		File genertaedWavFile = getNewFile(targetWavFilePath);
		
		if(genertaedWavFile==null)
		{
			throw new Exception("Failed to generate file");
		}	
		// Delete the queued original format file;
		deleteFile(queuedOriginalFormat);
		// Generate the WaveForm
		waveCoordinates = generateWaveCoordinatesFromWavFile(genertaedWavFile);
		writeCoordinatesToFile(wavCoordinates + "\\" + audioFileName + ".TXT", waveCoordinates);

		System.out.println(waveCoordinates.size());
		// Convert the Wav file to an MP3
		convertWAVFileToMP3(targetWavFilePath);
		// Wait until the mp3 is ready
		File generatedMp3 = getNewFile(switchProcessMp3 + "\\" + audioFileName + ".MP3");
		System.out.println(generatedMp3.exists());
		// Delete the Wav File
		deleteFile(genertaedWavFile);

		try {
			FileUtils.moveFile(generatedMp3, convertedMp3);
			writeToMetaData(convertedMp3,"LYRICRECORDER.COM_WAVPOINTS_0.0.1",waveCoordinates, audioFileName);
		} catch (FileExistsException e) {
			deleteFile(generatedMp3);
		}
		return waveCoordinates;
	}
	
	private void setFolder(String RESOURCES_FOLDER) {
		audioConvertExecutable = RESOURCES_FOLDER + "\\switch\\switch.exe";
		commandStub1 = "cmd /c start " + RESOURCES_FOLDER + "\\scripts\\audioConvert1.bat ";
		commandStub2 = "cmd /c start " + RESOURCES_FOLDER + "\\scripts\\audioConvert2.bat ";
		switchProcessRoot = RESOURCES_FOLDER + "\\switchProcessing";
		switchProcessQueue = switchProcessRoot + "\\1-queued";
		switchProcessWav = switchProcessRoot + "\\2-wav";
		switchProcessMp3 = switchProcessRoot + "\\3-mp3";
		theOriginalUpload = RESOURCES_FOLDER + "\\originalUpload\\";
		convertedMP3 = RESOURCES_FOLDER + "\\convertedMp3\\";
		wavCoordinates = RESOURCES_FOLDER + "\\wavForm\\";
	}
	
	private void writeToMetaData(File file, String description, Vector <Coordinate> coordinates, String audioFileName) {
		
		StringBuilder sb=new StringBuilder();
		for (Coordinate coordinate : coordinates) {
			sb.append(
					coordinate.getX() + "," + coordinate.getY_min() + "," + coordinate.getY_max() + newLineChar);
		}
		
		TagEditor tagEditor = new TagEditor();
		try {
			tagEditor.setCustomTag(file, description, sb.toString());
			tagEditor.setCustomTag(file, "LYRICRECORDER.COM_SONG_ID", audioFileName);
		} catch (CannotWriteException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (CannotReadException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TagException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ReadOnlyFileException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvalidAudioFrameException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		

	}



	private void convertAudioFileToWav(String sourceAudioFilePathAndName) throws IOException {
		runBatchFile(commandStub1, audioConvertExecutable, switchProcessWav, sourceAudioFilePathAndName);
	}

	private void convertWAVFileToMP3(String sourceAudioFilePathAndName) throws IOException {
		runBatchFile(commandStub2, audioConvertExecutable, switchProcessMp3, sourceAudioFilePathAndName);
	}

	private void runBatchFile(String commandStub, String audioConvertExecutable, String targetFolder,
			String sourceAudioFile) throws IOException {
		String command = commandStub + " \"" + audioConvertExecutable + "\" \"" + targetFolder + "\" \""
				+ sourceAudioFile + "\"";
		System.out.println(command);
		Runtime.getRuntime().exec(command);
	}

	private void deleteFile(File file) throws IOException, InterruptedException {
		long startTime = System.currentTimeMillis();
		long elapsedTime = -1;
		while (!file.renameTo(file)) {
			// Cannot read from file, windows still working on it.
			Thread.sleep(100);
			elapsedTime = (System.currentTimeMillis() - startTime) / 1000;
			System.out.println("Deleting file: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
			if(elapsedTime>MAXIMUM_WAIT_TIME_IN_SECONDS)
			{
				System.out.println("File took too long to delete: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
				break;
			}
		}
		Files.delete(file.toPath());
	}

	private File getNewFile(String filePath) throws InterruptedException {
		long startTime = System.currentTimeMillis();
		long elapsedTime = -1;
		File file = new File(filePath);
		while (!file.renameTo(file)) {
			Thread.sleep(100);
			elapsedTime = (System.currentTimeMillis() - startTime) / 1000;
			System.out.println("Waiting for file: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
			if(elapsedTime>MAXIMUM_WAIT_TIME_IN_SECONDS)
			{
				System.out.println("File took too long to generate: " + file.getPath() + ". Elapsed Time=" + elapsedTime + " sec");
				return null;
			}
		}
		return file;
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
