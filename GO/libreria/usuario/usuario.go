package usuario

import (
	"net/http"
	"database/sql"
	"fmt"
	"encoding/json"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"

	"github.com/pacomisval/Gnommo_api/GO/encriptacion/cookie"
)



////////////////// GET USUARIOS /////////////////////////
func getUsuarios(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var usuarios []Usuario

	result, err := db.Query("SELECT * FROM usuarios")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var usuario Usuario
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
		if err != nil {
			panic(err.Error())
		}
		usuarios = append(usuarios, usuario)
	}
	json.NewEncoder(w).Encode(usuarios)

	fmt.Println("ESTO ES GET USUARIOS")
}

/////////////// GET USUARIO POR ID //////////////////////
func getUsuario(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)

	result, err := db.Query("SELECT * FROM usuarios WHERE id = ?", params["id"])
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	var usuario Usuario

	for result.Next() {
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
		if err != nil {
			panic(err.Error())
		}
	}
	json.NewEncoder(w).Encode(usuario)

	fmt.Println("ESTO ES USUARIO PO ID")
}

/////////////////// POST USUARIO ////////////////////////

func postUsuario(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	stmt, err := db.Prepare("INSERT INTO usuarios(id, nombre, password, email, rol, tok, codigo) VALUES (?,?,?,?,?,?,?)")
	if err != nil {
		panic(err.Error())
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}
	key := make(map[string]string)
	json.Unmarshal(body, &key)

	id := key["id"]
	nombre := key["nombre"]
	password := key["password"]
	email := key["email"]
	rol := key["rol"]
	tok := key["tok"]
	codigo := key["tok"]

	pass := encriptarPass(password, email)
	tok = crearToken(id, nombre, email)

	_, err = stmt.Exec(&id, &nombre, &pass, &email, &rol, &tok, &codigo)
	if err != nil {
		panic(err.Error())
	}

	result, err := db.Query("SELECT * FROM usuarios WHERE email like ?", &email)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()

	var usuario Usuario

	for result.Next() {
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
		if err != nil {
			panic(err.Error())
		}
	}

	value := Value{usuario.Id, usuario.Nombre, usuario.Rol, usuario.Tok}

	json.NewEncoder(w).Encode(value)

	fmt.Println("ESTO ES POST USUARIO")
}

///////////////////// PUT USUARIO ///////////////////////
func putUsuario(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ?, codigo = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}

	key := make(map[string]string)
	json.Unmarshal(body, &key)

	newId := key["id"]
	newNombre := key["nombre"]
	newPassword := key["password"]
	newEmail := key["email"]
	newRol := key["rol"]
	newTok := key["tok"]
	newCodigo := key["codigo"]

	_, err = stmt.Exec(&newId, &newNombre, &newPassword, &newEmail, &newRol, &newTok, &newCodigo, params["id"])
	if err != nil {
		panic(err.Error())
	}
	fmt.Fprintf(w, "Se ha actualizado el usuario %s correctamente", params["id"])
	fmt.Println("ESTO ES UPDATE USUARIOS")
}

///////////////////// DELETE USUARIO //////////////////////
func deleteUsuario(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	///////////////////////////////////////////////

	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}

	///////////////////////////////////////////////

	params := mux.Vars(r)

	stmt, err := db.Prepare("DELETE FROM usuarios WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(params["id"])
	if err != nil {
		panic(err.Error())
	}

	fmt.Fprintf(w, "Se ha eliminado el usuario %s correctamente ", params["id"])
	fmt.Println("ESTO ES DELETE USUARIO")
}