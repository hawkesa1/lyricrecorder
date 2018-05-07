package com.lr;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class MP3MetaData {

	private String title;
	private String artist;
	private String album;
	private String uniqueId;
	private String downloadId;
	private String unsynchronisedLyrics;
	private String lyricRecorderSynchronisedLyrics;
	private String md5Hash;
	private String originalFileName;
	
	HashMap<String, String> allTags;

	public MP3MetaData() {
		super();
	}

	public MP3MetaData(String title, String artist, String album, String uniqueId) {
		super();
		this.title = title;
		this.artist = artist;
		this.album = album;
		this.uniqueId = uniqueId;
	}
	
	public String getOriginalFileName() {
		return originalFileName;
	}

	public void setOriginalFileName(String originalFileName) {
		this.originalFileName = originalFileName;
	}

	public String getMd5Hash() {
		return md5Hash;
	}

	public void setMd5Hash(String md5Hash) {
		this.md5Hash = md5Hash;
	}

	public String getDownloadId() {
		return downloadId;
	}

	public void setDownloadId(String downloadId) {
		this.downloadId = downloadId;
	}

	public String getLyricRecorderSynchronisedLyrics() {
		return lyricRecorderSynchronisedLyrics;
	}

	public void setLyricRecorderSynchronisedLyrics(String lyricRecorderSynchronisedLyrics) {
		this.lyricRecorderSynchronisedLyrics = lyricRecorderSynchronisedLyrics;
	}

	public String getUnsynchronisedLyrics() {
		return unsynchronisedLyrics;
	}

	public void setUnsynchronisedLyrics(String unsynchronisedLyrics) {
		this.unsynchronisedLyrics = unsynchronisedLyrics;
	}

	public HashMap<String, String> getAllTags() {
		return allTags;
	}

	public void setAllTags(HashMap<String, String> allTags) {
		this.allTags = allTags;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getArtist() {
		return artist;
	}

	public void setArtist(String artist) {
		this.artist = artist;
	}

	public String getAlbum() {
		return album;
	}

	public void setAlbum(String album) {
		this.album = album;
	}

	public String getUniqueId() {
		return uniqueId;
	}

	public void setUniqueId(String uniqueId) {
		this.uniqueId = uniqueId;
	}

	public static MP3MetaData readMP3MetaDataFromDisk(String uniqueId) throws FileNotFoundException {
		Gson gson = new Gson();
		BufferedReader br = new BufferedReader(
				new FileReader(RESOURCES_FOLDER + "\\mp3MetaData\\" + uniqueId + ".json"));
		MP3MetaData mp3MetaData = gson.fromJson(br, MP3MetaData.class);
		return mp3MetaData;
	}

	public static void writeMP3MetaDataToDisk(MP3MetaData mp3MetaData) throws IOException {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(mp3MetaData);
		FileWriter writer = new FileWriter(RESOURCES_FOLDER + "\\mp3MetaData\\" + mp3MetaData.getUniqueId() + ".json");
		writer.write(json);
		writer.close();
	}

	public String toJSON() {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		return gson.toJson(this);
	}

	private static String RESOURCES_FOLDER = System.getProperty("RESOURCES_FOLDER");
	
	
	
}
