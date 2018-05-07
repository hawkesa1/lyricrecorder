package com.lr.servlet;

import java.io.FileWriter;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.lr.VideoGenerator;

/**
 * Servlet implementation class VideoDataUploadServlet
 */
@WebServlet("/VideoDataUploadServlet")
public class VideoDataUploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public VideoDataUploadServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String currentTime = Long.toString(System.currentTimeMillis());
		String jSONFormattedLyricData = request.getParameter("JSONFormattedLyricData");
		String songId = request.getParameter("songId");

		System.out.println(jSONFormattedLyricData);

		String path = writeToFile(jSONFormattedLyricData, songId);

		VideoGenerator videoGenerator = new VideoGenerator();
		videoGenerator.generateVideo(songId, path, jSONFormattedLyricData);

		response.setContentType("text/plain");
		response.setCharacterEncoding("UTF-8");
		// System.out.println("Meta data" + mP3MetaData.toJSON());

		response.getWriter().write("success");
	}

	private String writeToFile(String jSONFormattedLyricData, String songId) {
		String filePath1 = RESOURCES_FOLDER + "\\videoScripts\\" + songId + ".json";
		try (FileWriter file = new FileWriter(filePath1)) {
			file.write(prettyPrintJSON(jSONFormattedLyricData));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return "resources/videoScripts/" + songId + ".json";
	}

	private String prettyPrintJSON(String JSONFormattedLyricData) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonParser jp = new JsonParser();
		JsonElement je = jp.parse(JSONFormattedLyricData);
		return gson.toJson(je);
	}

	private static String RESOURCES_FOLDER = System.getProperty("RESOURCES_FOLDER");
}
