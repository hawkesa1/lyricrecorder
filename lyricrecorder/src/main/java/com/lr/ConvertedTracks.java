package com.lr;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;

public class ConvertedTracks {

	private static Map<String, String> convertedTracks = null;

	public static void addTrack(String md5Hash, String uniqueId) {
		getConvertedTracks().put(md5Hash, uniqueId);
	}

	public static String searchTrack(String md5Hash) {
		return getConvertedTracks().get(md5Hash);
	}

	private static Map<String, String> getConvertedTracks() {
		if (convertedTracks == null) {
			convertedTracks = new HashMap<String, String>();
			readTracksFromStorage(RESOURCES_FOLDER + File.separator + "mp3MetaData" + File.separator);
		}
		return convertedTracks;
	}

	private static void readTracksFromStorage(String folderPath) {
		File folder = new File(folderPath);
		MP3MetaData mp3MetaData;
		for (final File fileEntry : folder.listFiles()) {
			if (fileEntry.isDirectory()) {
				// Do Nothing
			} else {
				if (FilenameUtils.getExtension(fileEntry.getName()).toUpperCase().equals("JSON")) {
					System.out.println(fileEntry.getName());
					try {
						mp3MetaData = readTrackFromDisk(folderPath, fileEntry.getName());
						convertedTracks.put(mp3MetaData.getMd5Hash(), mp3MetaData.getUniqueId());
					} catch (FileNotFoundException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		}
	}

	private static MP3MetaData readTrackFromDisk(String folder, String fileName) throws FileNotFoundException {
		Gson gson = new Gson();
		BufferedReader br = new BufferedReader(new FileReader(folder + fileName));
		MP3MetaData mp3MetaData = gson.fromJson(br, MP3MetaData.class);
		return mp3MetaData;
	}

	private static String RESOURCES_FOLDER = System.getProperty("RESOURCES_FOLDER");
	// private static String RESOURCES_FOLDER =
	// "C:\\Users\\Hawkes\\2016WorkSpace\\lyricrecorder\\WebContent\\resources";

	public static void main(String[] args) {
		ConvertedTracks convertedTracks = new ConvertedTracks();
		System.out.println(convertedTracks.searchTrack("ff4c89a9f1cc2d4321c5d4a7e91fad38"));

		// convertedTracks.readTracksFromStorage(RESOURCES_FOLDER +
		// "\\mp3MetaData\\");
	}

}
