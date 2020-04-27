package libro

import (
	"net/http"
	"database/sql"
	"fmt"
	"encoding/json"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"

	"github.com/pacomisval/Gnommo_api/GO/encriptacion/cookie"
)

type Libro struct {
	Id      string `json:"id"`
	Nombre  string `json:"nombre"`
	Isbn    string `json:"isbn"`
	IdAutor string `json:"idAutor"`
	Portada string `json:"portada"`

	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

var db *sql.DB
var err error

//////////////////// GET LIBROS ////////////////////////
func getLibros(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var libros []Libro

	result, err := db.Query("SELECT * FROM books")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var libro Libro
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada)
		if err != nil {
			panic(err.Error())
		}
		libros = append(libros, libro)
	}

	json.NewEncoder(w).Encode(libros)

	fmt.Println("ESTO ES GET LIBROS")
}

/////////////// GET LIBROS POR AUTOR ///////////////////////////
func getLibrosByAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var libros []Libro

	params := mux.Vars(r)

	result, err := db.Query("SELECT * FROM books WHERE idAutor = ?", params["id"])
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var libro Libro
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada)
		if err != nil {
			panic(err.Error())
		}
		libros = append(libros, libro)
	}
	json.NewEncoder(w).Encode(libros)

	fmt.Println("ESTO ES GET LIBRO POR AUTOR")
}

/////////////////////// GET TODO ////////////////////
func getAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var libros []Libro

	result, err := db.Query("SELECT b.id, b.nombre, b.isbn, b.idAutor, b.portada, a.first_name, a.last_name FROM books b INNER JOIN autor a ON b.idAutor = a.id")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var libro Libro

		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada, &libro.FirstName, &libro.LastName)
		if err != nil {
			panic(err.Error())
		}
		libros = append(libros, libro)
	}
	json.NewEncoder(w).Encode(libros)

	fmt.Println("ESTO ES GET ALL")
}

/////////////// GET LIBRO POR ID /////////////////////
func getLibro(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)

	result, err := db.Query("SELECT * FROM books WHERE id = ?", params["id"])
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	var libro Libro

	for result.Next() {
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada)
		if err != nil {
			panic(err.Error())
		}
	}
	json.NewEncoder(w).Encode(libro)

	fmt.Println("ESTO ES GET BY ID")
}

//////////////////// POST LIBRO ///////////////////////
func postLibro(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	///////////////////////////////////////////////
	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}
	///////////////////////////////////////////////

	/* uploadFileHandler(w, r)
	fmt.Println("EL VALOR DEL FICHERO EN POST LIBRO: " , fichero ) */

	//stmt, err := db.Prepare("INSERT INTO books(id, nombre, isbn, idAutor) VALUES(?,?,?,?)")
	stmt, err := db.Prepare("INSERT INTO books(nombre, isbn, idAutor, portada) VALUES(?,?,?,?)")

	if err != nil {
		panic(err.Error())
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}

	// archivoaux := body.isbn
	// archivo := archivoaux + "."

	keyVal := make(map[string]string)
	json.Unmarshal(body, &keyVal)

	//id := keyVal["id"]
	nombre := keyVal["nombre"]
	isbn := keyVal["isbn"]
	idAutor := keyVal["id_author"] //mirar si falla FK es idAutor
	portada := keyVal["portada"]
	//fmt.Println("inserta LIBRO:", id, nombre, isbn, idAutor)

	_, err = stmt.Exec(&nombre, &isbn, &idAutor, &portada)

	if err != nil {
		panic(err.Error())
	}
	//	fmt.Fprintf(w, "Se a añadido un nuevo libro")

	fmt.Println("ESTO ES POST LIBRO")
}

///////////////////// PUT LIBRO /////////////////////
func putLibro(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Type", "application/x-www-form-urlencoded")

	///////////////////////////////////////////////

	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}

	///////////////////////////////////////////////
	params := mux.Vars(r)

	stmt, err := db.Prepare("UPDATE books SET id = ?, nombre = ?, isbn = ?, idAutor = ?, portada = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}

	claveValor := make(map[string]string)
	json.Unmarshal(body, &claveValor)

	newId := claveValor["id"]
	newNombre := claveValor["nombre"]
	newIsbn := claveValor["isbn"]
	newIdAutor := claveValor["idAutor"]
	newPortada := claveValor["portada"]

	_, err = stmt.Exec(&newId, &newNombre, &newIsbn, &newIdAutor, &newPortada, params["id"])
	if err != nil {
		panic(err.Error())
	}

	// fmt.Fprintf(w, "El registro con Id %s se ha actualizado correctamente", params["id"])
	fmt.Println("ESTO ES PUT LIBRO")
}

////////////////// DELETE LIBRO /////////////////////////
func deleteLibro(w http.ResponseWriter, r *http.Request) {

	///////////////////////////////////////////////////////////
	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}
	////////////////////////////////////////////////////////////////

	params := mux.Vars(r)

	stmt, err := db.Prepare("DELETE FROM books WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(params["id"])
	if err != nil {
		panic(err.Error())
	}

	//	fmt.Fprintf(w, "Se ha eliminado el libro con Id %s", params["id"])
	fmt.Println("ESTO ES DELETE LIBRO")
}