package autor

import (
	"net/http"
	"database/sql"
	"fmt"
	"encoding/json"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"

	"github.com/pacomisval/Gnommo_api/GO/encriptacion/cookie"
)


//////////////////////// GET AUTORES ///////////////////
func getAutores(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var autores []Autor

	result, err := db.Query("SELECT * FROM autor")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var autor Autor
		err := result.Scan(&autor.Id, &autor.FirstName, &autor.LastName)
		if err != nil {
			panic(err.Error())
		}
		autores = append(autores, autor)
	}
	json.NewEncoder(w).Encode(autores)

	fmt.Println("ESTOS SON TODOS LOS AUTORES")
}

/////////////////// GET AUTOR POR ID //////////////////
func getAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)

	result, err := db.Query("SELECT * FROM autor WHERE id = ?", params["id"])
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	var autor Autor

	for result.Next() {
		err := result.Scan(&autor.Id, &autor.FirstName, &autor.LastName)
		if err != nil {
			panic(err.Error())
		}
	}
	json.NewEncoder(w).Encode(autor)

	fmt.Println("ESTO ES GET AUTOR POR ID")

}

/////////////////////// POST AUTOR ////////////////////
func postAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	///////////////////////////////////////////////

	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}

	///////////////////////////////////////////////

	stmt, err := db.Prepare("INSERT INTO autor(id, first_name, last_name) VALUES (?,?,?)")
	if err != nil {
		panic(err.Error())
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}
	clave := make(map[string]string)
	json.Unmarshal(body, &clave)

	id := clave["id"]
	firstName := clave["first_name"]
	lastName := clave["last_name"]

	_, err = stmt.Exec(&id, &firstName, &lastName)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("ESTO ES POST AUTOR")
}

////////////////////// PUT AUTOR //////////////////////
func putAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	///////////////////////////////////////////////

	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}

	///////////////////////////////////////////////
	fmt.Println("ESTO ES PUT AUTOR 1")

	params := mux.Vars(r)

	stmt, err := db.Prepare("UPDATE autor SET first_name = ?, last_name = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}

	key := make(map[string]string)
	json.Unmarshal(body, &key)

	//nuevoId := key["idAutor"]
	nuevoFirstName := key["first_name"]
	nuevoLastName := key["last_name"]

	_, err = stmt.Exec(&nuevoFirstName, &nuevoLastName, params["id"])
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("ESTO ES UPDATE AUTOR")
}

//////////////////// DELETE AUTOR ////////////////////////
func deleteAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	///////////////////////////////////////////////

	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}

	///////////////////////////////////////////////

	params := mux.Vars(r)

	stmt, err := db.Prepare("DELETE FROM autor WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(params["id"])
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("ESTO ES DELETE AUTOR")
}

///////////////////////BUSCAR Si existe Autor POR NOMBRE ////////////////////
func buscaAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("entra en buscar autor")

	//params := mux.Vars(r)
	fmt.Println(r.Body)

	result, err := db.Prepare("SELECT * FROM autor WHERE first_name =? and last_name=?")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}
	clave := make(map[string]string)
	json.Unmarshal(body, &clave)

	firstName := clave["first_name"]
	lastName := clave["last_name"]

	_, err = result.Exec(&firstName, &lastName)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println(result)

}