package com.lr.servlet;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.CopyOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jaudiotagger.audio.exceptions.CannotReadException;
import org.jaudiotagger.audio.exceptions.CannotWriteException;
import org.jaudiotagger.audio.exceptions.InvalidAudioFrameException;
import org.jaudiotagger.audio.exceptions.ReadOnlyFileException;
import org.jaudiotagger.tag.TagException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.lr.MP3MetaData;
import com.lr.TagEditor;

/**
 * Servlet implementation class FileUploadServlet
 */
@WebServlet("/LyricUploadServlet")
public class LyricUploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor.
	 */
	public LyricUploadServlet() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String currentTime = Long.toString(System.currentTimeMillis());
		String jSONFormattedLyricData = request.getParameter("JSONFormattedLyricData");
		String songId = request.getParameter("songId");
		String fileName = createDownloadableCopy(songId);
		MP3MetaData mP3MetaData = writeToMetaData(jSONFormattedLyricData, fileName);
		mP3MetaData.setDownloadId(fileName);
		writeToFile(mP3MetaData.toJSON(), songId);
		response.setContentType("text/plain");
		response.setCharacterEncoding("UTF-8");
		//System.out.println("Meta data" + mP3MetaData.toJSON());
		
		response.getWriter().write(mP3MetaData.toJSON());
	}

	private String createDownloadableCopy(String songId) throws IOException {
		String filePath1 = RESOURCES_FOLDER + "\\convertedMp3\\" + songId + ".MP3";
		String fileName = songId + "_" + Long.toString(System.currentTimeMillis()) + ".MP3";
		String filePath2 = RESOURCES_FOLDER + "\\downloadableMp3\\" + fileName;
		Path FROM = Paths.get(filePath1);
		Path TO = Paths.get(filePath2);
		// overwrite existing file, if exists
		CopyOption[] options = new CopyOption[] { StandardCopyOption.REPLACE_EXISTING,
				StandardCopyOption.COPY_ATTRIBUTES };
		java.nio.file.Files.copy(FROM, TO, options);
		return fileName;
	}

	// Add the lyrics to the mp3 file
	private MP3MetaData writeToMetaData(String jSONFormattedLyricData, String songId) {
		String filePath1 = RESOURCES_FOLDER + "\\downloadableMp3\\" + songId;
		TagEditor tagEditor = new TagEditor();
		String description = "LYRICRECORDER.COM_LYRICS_0.0.1";
		String text = prettyPrintJSON(jSONFormattedLyricData);
		File file = new File(filePath1);

		try {
			tagEditor.setCustomTag(file, description, text);
			System.out.println("Added Tag tio File");
			;
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

		MP3MetaData mP3MetaData = null;
		try {
			mP3MetaData = convert(tagEditor.readAllTags(new File(filePath1)), songId);
			mP3MetaData.setLyricRecorderSynchronisedLyrics(jSONFormattedLyricData);
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
		return mP3MetaData;

	}

	private MP3MetaData convert(HashMap<String, String> allTags, String currentTime) {
		MP3MetaData mp3MetaData = new MP3MetaData();
		mp3MetaData.setAlbum(allTags.get("ALBUM"));
		mp3MetaData.setArtist(allTags.get("ARTIST"));
		mp3MetaData.setTitle(allTags.get("TITLE"));
		mp3MetaData.setUnsynchronisedLyrics(allTags.get("LYRICS"));
		mp3MetaData.setLyricRecorderSynchronisedLyrics(allTags.get("LYRICRECORDER.COM_LYRICS_0.0.1"));
		mp3MetaData.setAllTags(allTags);
		mp3MetaData.setUniqueId(currentTime);
		return mp3MetaData;
	}

	private void writeToFile(String jSONFormattedLyricData, String songId) {
		String filePath1 = RESOURCES_FOLDER + "\\mp3MetaData\\" + songId + ".json";
		try (FileWriter file = new FileWriter(filePath1)) {
			file.write(prettyPrintJSON(jSONFormattedLyricData));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private String prettyPrintJSON(String JSONFormattedLyricData) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonParser jp = new JsonParser();
		JsonElement je = jp.parse(JSONFormattedLyricData);
		return gson.toJson(je);
	}

	private static String RESOURCES_FOLDER = System.getProperty("RESOURCES_FOLDER");

}
