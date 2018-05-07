package com.lr.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sound.sampled.UnsupportedAudioFileException;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;

import com.lr.FileActivities;

/**
 * Servlet implementation class FileReceiver
 */
@WebServlet("/FileReceiver")
public class FileReceiver extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public FileReceiver() {
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
		String fileName = "";
		
		System.out.println("Hello Alex");
		try {
			List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(request);
			for (FileItem item : items) {
				if (item.isFormField()) {
					String fieldName = item.getFieldName();
					String fieldValue = item.getString();

				} else {
					try {
						fileName = processUploadedFile(item, currentTime);

					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				}
			}
		} catch (FileUploadException e) {
			throw new ServletException("Cannot parse multipart request.", e);
		} catch (UnsupportedAudioFileException e) {
			e.printStackTrace();
		}
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		//response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(fileName);
	}

	private String processUploadedFile(FileItem item, String uniqueId)
			throws IOException, UnsupportedAudioFileException, InterruptedException {
		String ext = FilenameUtils.getExtension(item.getName());
		String fileName = uniqueId + "." + ext;

		FileActivities.writeUploadedFileToDisk(item,
				"C:\\Users\\Hawkes\\2016WorkSpace\\lyricrecorder\\WebContent\\images\\" + fileName);
		return fileName;
	}

}
