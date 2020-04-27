package uploadFile

import (
	"net/http"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"os"
	"mime"
	"html/template"
	"encoding/json"
	"crypto/rand"	
)


func uploadFileHandler(w http.ResponseWriter, r *http.Request ) {

	if r.Method == "GET" {
		t, _ := template.ParseFiles("upload.gtpl")
		t.Execute(w, nil)
		fmt.Println("valor de t: ", t);
		return
	}
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		fmt.Printf("Could not parse multipart form: %v\n", err)
		renderError(w, "CANT_PARSE_FORM", http.StatusInternalServerError)
		return
	}

	// parse and validate file and post parameters
	file, fileHeader, err := r.FormFile("uploadFile")
	if err != nil {
		renderError(w, "INVALID_FILE", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Get and print out file size
	fileSize := fileHeader.Size
	fmt.Printf("File size (bytes): %v\n", fileSize)
	// validate file size
	if fileSize > maxUploadSize {
		renderError(w, "FILE_TOO_BIG", http.StatusBadRequest)
		return
	}

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		renderError(w, "INVALID_FILE", http.StatusBadRequest)
		return
	}
	
	// check file type, detectcontenttype only needs the first 512 bytes
	detectedFileType := http.DetectContentType(fileBytes)
	switch detectedFileType {
	case "image/jpeg", "image/jpg":
	case "image/gif", "image/png":
	case "application/pdf":
		break
	default:
		renderError(w, "INVALID_FILE_TYPE", http.StatusBadRequest)
		return
	}
	fileName := fileHeader.Filename           //randToken(12)   // archivo
	fileEndings, err := mime.ExtensionsByType(detectedFileType)
	if err != nil {
		renderError(w, "CANT_READ_FILE_TYPE", http.StatusInternalServerError)
		return
	}
	newPath := filepath.Join(uploadPath, fileName+fileEndings[0])
	fmt.Printf("FileType: %s, FilePath: %s, FileName: %s\n", detectedFileType, newPath, fileName)

	// write file
	newFile, err := os.Create(newPath)
	if err != nil {
		renderError(w, "CANT_WRITE_FILE", http.StatusInternalServerError)
		fmt.Println("valor de w1: ", w)
		return
	}
	defer newFile.Close()

	if _, err := newFile.Write(fileBytes); err != nil || newFile.Close() != nil {
		renderError(w, "CANT_WRITE_FILE", http.StatusInternalServerError)
		fmt.Println("valor de w2: ", w)
		return
	}
	fmt.Println("Todo ha ido bien. Has llegado al final !!")
	//w.Write([]byte("SUCCESS"))

	json.NewEncoder(w).Encode(fileName)
}                                          

func renderError(w http.ResponseWriter, message string, statusCode int) {

	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte(message))
}

func randToken(len int) string {

	b := make([]byte, len)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
