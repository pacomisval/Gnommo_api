package main

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Libro struct {
	Id      string `json:"id"`
	Nombre  string `json:"nombre"`
	Isbn    string `json:"isbn"`
	IdAutor string `json:"idAutor"`

	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type Autor struct {
	Id        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type Usuario struct {
	Id       string `json:"id"`
	Nombre   string `json:"nombre"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Rol      string `json:"rol"`
	Tok      string `json:"tok"`
}
type Claims struct {
	//Id     uint
	Nombre string
	Email  string
	*jwt.StandardClaims
}
type Value struct {
	Id     string `json:"id"`
	Nombre string `json:"Nombre"`
	Rol    string `json:"rol"`
	Token  string `json:"token"`
}

// type Answer struct {
// 	Token string `json:"token"`
// }
// type Toki struct {
// 	Token string
// }

var db *sql.DB
var err error

func main() {
	db, err = sql.Open("mysql", "root:root@tcp(127.0.0.1:3306)/libreria")
	if err != nil {
		panic(err.Error())
	}

	defer db.Close()

	fmt.Println("Funcionando.......")

	router := mux.NewRouter()

	router.HandleFunc("/api/libros", getLibros).Methods("GET")
	router.HandleFunc("/api/libros/autor/{id}", getLibrosByAutor).Methods("GET")
	router.HandleFunc("/api/libros/all", getAll).Methods("GET")
	router.HandleFunc("/api/libros/{id}", getLibro).Methods("GET")
	router.HandleFunc("/api/libros", postLibro).Methods("POST")
	router.HandleFunc("/api/libros/{id}", putLibro).Methods("PUT")
	router.HandleFunc("/api/libros/{id}", deleteLibro).Methods("DELETE")

	router.HandleFunc("/api/autores", getAutores).Methods("GET")
	router.HandleFunc("/api/autores/{id}", getAutor).Methods("GET")
	router.HandleFunc("/api/autores", postAutor).Methods("POST")
	router.HandleFunc("/api/autores/{id}", putAutor).Methods("PUT")
	router.HandleFunc("/api/autores/{id}", deleteAutor).Methods("DELETE")

	router.HandleFunc("/api/usuarios", getUsuarios).Methods("GET")
	router.HandleFunc("/api/usuarios/{id}", getUsuario).Methods("GET")
	router.HandleFunc("/api/usuarios", postUsuario).Methods("POST")
	router.HandleFunc("/api/usuarios/{id}", putUsuario).Methods("PUT")
	router.HandleFunc("/api/usuarios/{id}", deleteUsuario).Methods("DELETE")

	// router.HandleFunc("/api/registro", postUsuario).Methods("POST")
	router.HandleFunc("/api/login", login).Methods("POST")

	//http.ListenAndServe(":8000", router)
	log.Fatal(http.ListenAndServe(":8000", handlers.CORS(
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "Accept", "Accept-Language"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS"}),
		handlers.AllowCredentials(),
		handlers.AllowedOrigins([]string{"http://localhost:4200"}))(router)))
}

////////////////////////////////////// INICIO ENCRIPTACION /////////////////////////////////////

func encriptarPass(pass string, clave string) string {
	hashMD5 := MD5Hash(pass)
	hashHMAC := HMACHash(hashMD5, clave)
	return hashHMAC
}

func MD5Hash(pass string) string {
	hash := md5.New()
	hash.Write([]byte(pass))
	return hex.EncodeToString(hash.Sum(nil))
}

func HMACHash(pass string, clave string) string {
	hash := hmac.New(sha256.New, []byte(clave))
	io.WriteString(hash, pass)
	return fmt.Sprintf("%x", hash.Sum(nil))
}

func validarPass(passInput, passwordDB string) bool {

	bytePassDB := []byte(passwordDB)

	byteInput := []byte(passInput)

	resHMAC := hmac.Equal(byteInput, bytePassDB)

	return resHMAC
}

func login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("entra en login ")

	user := &Usuario{}
	err := json.NewDecoder(r.Body).Decode(user)

	if err != nil {
		var resp = map[string]interface{}{"status": false, "message": "Invalid request"}
		json.NewEncoder(w).Encode(resp)
		return
	}
	fmt.Println("Va a encontrar usuario: ")

	value := encontrarUsuario(user.Password, user.Email)
	fmt.Println("Vuelve encontrar usuario: ")

	I := value.Id
	N := value.Nombre
	R := value.Rol
	T := value.Token

	expiration := time.Now().Add(time.Minute * 5)

	cookie1 := &http.Cookie{
		Name:     "tokensiI",
		Value:    I,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false}

	http.SetCookie(w, cookie1)
	r.AddCookie(cookie1)

	cookie2 := &http.Cookie{
		Name:     "tokensiN",
		Value:    N,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false}

	http.SetCookie(w, cookie2)
	r.AddCookie(cookie2)

	cookie3 := &http.Cookie{
		Name:     "tokensiR",
		Value:    R,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false}

	http.SetCookie(w, cookie3)
	r.AddCookie(cookie3)

	cookie4 := &http.Cookie{
		Name:     "tokensiT",
		Value:    T,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false}

	http.SetCookie(w, cookie4)
	r.AddCookie(cookie4)
	////////////COMENTAR SI NO VA/////////VVV
	http.SetCookie(w, &http.Cookie{
		Name:    "Rol",
		Value:   base64.StdEncoding.EncodeToString([]byte(value.Rol)),
		Expires: time.Now().Add(time.Minute * 5),

		Path:     "/",
		HttpOnly: false,
	})
	cuki := &http.Cookie{
		Name:    "token",
		Value:   value.Token,
		Expires: time.Now().Add(time.Minute * 365 * 24 * 60 * 60),
		//	Secure:   true,
		Path:     "/",
		HttpOnly: true,
	}
	http.SetCookie(w, cuki)
	r.AddCookie(cuki)
	////////////COMENTAR SI NO VA/////////^^^^
	fmt.Println("valor: ", value)
	//	json.NewEncoder(w).Encode(value)
	json.NewEncoder(w).Encode(value)
	fmt.Println("El valor de W://////////////////////////////////// ", w)

	return
}

func encontrarUsuario(password, email string) Value {
	var user []Usuario
	var ok bool
	var id string
	var nombre string
	var passDB string
	var mail string
	var rol string
	var resultVacio bool
	resultVacio = true

	expireAt := time.Now().Add(time.Minute * 5).Unix()
	result, err := db.Query("SELECT * FROM usuarios WHERE email like ?", &email)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()
	for result.Next() {
		resultVacio = false
		fmt.Println("entra en for result.next")
		var usuario Usuario
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok)
		if err != nil {
			panic(err.Error())
		}
		user = append(user, usuario)
		id = usuario.Id
		nombre = usuario.Nombre
		passDB = usuario.Password
		mail = usuario.Email
		rol = usuario.Rol
	}

	if resultVacio {
		//	fmt.Println("Es usuario vacio")
		Id := "0"
		Nombre := "error"
		Rol := "NO se ha encontrado el Email"
		Token := "Email not Found"
		value := Value{Id, Nombre, Rol, Token}
		return value
	}
	contra := encriptarPass(password, email)

	ok = validarPass(contra, passDB)
	if !ok {
		Id := "0"
		Nombre := "error"
		Rol := "Contraseña Incorrecta"
		Token := "Error NO coinciden las contraseñas"
		value := Value{Id, Nombre, Rol, Token}
		return value
	}

	claims := Claims{
		Nombre: nombre,
		Email:  mail,
		StandardClaims: &jwt.StandardClaims{
			ExpiresAt: expireAt,
		},
	}

	Secret := []byte(mail)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(Secret)
	if err != nil {
		Id := "0"
		Nombre := "error"
		Rol := "NO se ha creado el token"
		Token := "Error en el token"
		value := Value{Id, Nombre, Rol, Token}
		return value
	}

	guardarToken(tokenString, id)
	value := Value{id, nombre, rol, tokenString}
	return value
}

func guardarToken(token, id string) {

	var iddb string
	var nombre string
	var passwd string
	var email string
	var rol string
	var tok string

	result, err := db.Query("SELECT * FROM usuarios WHERE id = ?", &id)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()

	var usuario Usuario

	for result.Next() {
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok)
		if err != nil {
			panic(err.Error())
		}
	}
	iddb = usuario.Id
	nombre = usuario.Nombre
	passwd = usuario.Password
	email = usuario.Email
	rol = usuario.Rol
	tok = token

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(iddb, nombre, passwd, email, rol, tok, id)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("ESTO ES GUARDAR TOKEN")

}

func recuperarToken(id string) string {
	result, err := db.Query("SELECT tok FROM usuarios WHERE id = ?", &id)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()

	var usuario Usuario

	for result.Next() {
		err := result.Scan(&usuario.Tok)
		if err != nil {
			panic(err.Error())
		}
	}

	return usuario.Tok
}

func crearToken(id, nombre, password, email string) string {

	expireAt := time.Now().Add(time.Minute * 125).Unix()
	claims := Claims{
		Nombre: nombre,
		Email:  email,
		StandardClaims: &jwt.StandardClaims{
			ExpiresAt: expireAt,
		},
	}

	Secret := []byte(email)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(Secret)
	if err != nil {
		panic(err.Error())
	}
	// resp := tokenString

	//fmt.Println("Token string: ", tokenString)

	guardarToken(tokenString, id)

	return tokenString
}

func verificarToken(tknStr, SecretKey string) int {
	resp := 0 // ok
	claims := &Claims{}

	tkn, err := jwt.ParseWithClaims(tknStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})
	/* fmt.Println("Valor del token: ", tknStr)
	fmt.Println("Valor de claims: ", claims) */
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			resp = 1 // StatusUnauthorized
			return resp
		}
		resp = 2 // StatusBadRequest
	}
	if !tkn.Valid {
		resp = 1
		return resp
	}
	fmt.Println("Dentro de verificarToken: ", resp)
	return resp
}

///////////////////////////////// FIN ENCRIPTACION ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// INICIO API LIBROS ////////////////////////////
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor)
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
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor)
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

	result, err := db.Query("SELECT b.id, b.nombre, b.isbn, b.idAutor, a.first_name, a.last_name FROM books b INNER JOIN autor a ON b.idAutor = a.id")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var libro Libro

		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.FirstName, &libro.LastName)
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
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor)
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
	//INSERT INTO books VALUES ('','nuevo','123','5')

	stmt, err := db.Prepare("INSERT INTO books(nombre, isbn, idAutor) VALUES(?,?,?)")

	if err != nil {
		panic(err.Error())
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err.Error())
	}
	keyVal := make(map[string]string)
	json.Unmarshal(body, &keyVal)

	//id := keyVal["id"]
	nombre := keyVal["nombre"]
	isbn := keyVal["isbn"]
	idAutor := keyVal["id_author"] //mirar si falla FK es idAutor
	//fmt.Println("inserta LIBRO:", id, nombre, isbn, idAutor)

	_, err = stmt.Exec(&nombre, &isbn, &idAutor)

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
	// for _, cookie := range r.Cookies() {
	// 	fmt.Fprint(w, cookie.Name)
	// }
	c, err := r.Cookie("tokensiT")
	if err != nil {
		fmt.Println("ERROR: ", err)
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Println("Error de StatusUnauthorized")
			return
		}
	}
	tknStr := c.Value

	secret := "felipe@mail.com"

	fmt.Println("Token en putLibro: ", tknStr)

	resp := verificarToken(tknStr, secret)
	fmt.Println("Esto es la respuesta de resp en PutLibro: ", resp)

	///////////////////////////////////////////////
	params := mux.Vars(r)

	stmt, err := db.Prepare("UPDATE books SET id = ?, nombre = ?, isbn = ?, idAutor = ? WHERE id = ?")
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

	_, err = stmt.Exec(&newId, &newNombre, &newIsbn, &newIdAutor, params["id"])
	if err != nil {
		panic(err.Error())
	}

	// fmt.Fprintf(w, "El registro con Id %s se ha actualizado correctamente", params["id"])
	fmt.Println("ESTO ES PUT LIBRO")
}

////////////////// DELETE LIBRO /////////////////////////
func deleteLibro(w http.ResponseWriter, r *http.Request) {
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

//////////////////////////////////// FIN API LIBROS ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// INICIO API AUTORES ///////////////////////////

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
	// fmt.Fprintf(w, "Se a añadido un nuevo autor con id %s ", clave["id"])

	fmt.Println("ESTO ES POST AUTOR")
}

////////////////////// PUT AUTOR //////////////////////
func putAutor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
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
	//	fmt.Fprintf(w, "Se ha actualizado el autor con id %s correctamente", params["id"])

	fmt.Println("ESTO ES UPDATE AUTOR")
}

//////////////////// DELETE AUTOR ////////////////////////
func deleteAutor(w http.ResponseWriter, r *http.Request) {

	params := mux.Vars(r)

	stmt, err := db.Prepare("DELETE FROM autor WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(params["id"])
	if err != nil {
		panic(err.Error())
	}

	//	fmt.Fprintf(w, "Se ha eliminado el autor %s correctamente ", params["id"])
	fmt.Println("ESTO ES DELETE AUTOR")
}

///////////////////////BUSCAR Si existe Autor POR NOMBRE ////////////////////
func buscaAutor(w http.ResponseWriter, r *http.Request) {
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
	//var autor Autor

	// for result.Next() {
	// 	err := result.Scan(&autor.Id, &autor.FirstName, &autor.LastName)
	// 	if err != nil {
	// 		panic(err.Error())
	// 	}
	// }
	fmt.Println(result)

}

//////////////////////////////// FIN API AUTORES //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// INICIO  API USUARIOS //////////////////////////////

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
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok)
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
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok)
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

	stmt, err := db.Prepare("INSERT INTO usuarios(id, nombre, password, email, rol, tok) VALUES (?,?,?,?,?,?)")
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

	pass := encriptarPass(password, email)
	tok = crearToken(id, nombre, password, email)

	_, err = stmt.Exec(&id, &nombre, &pass, &email, &rol, &tok)
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
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok)
		if err != nil {
			panic(err.Error())
		}
	}

	value := Value{usuario.Id, usuario.Nombre, usuario.Rol, usuario.Tok}
	//	crearCookie(w, "postUsuario", tok)
	json.NewEncoder(w).Encode(value)

	//fmt.Println(w)

	fmt.Println("ESTO ES POST USUARIO")
}

///////////////////// PUT USUARIO ///////////////////////
func putUsuario(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ? WHERE id = ?")
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

	_, err = stmt.Exec(&newId, &newNombre, &newPassword, &newEmail, &newRol, &newTok, params["id"])
	if err != nil {
		panic(err.Error())
	}
	fmt.Fprintf(w, "Se ha actualizado el usuario %s correctamente", params["id"])
	fmt.Println("ESTO ES UPDATE USUARIOS")
}

///////////////////// DELETE USUARIO //////////////////////
func deleteUsuario(w http.ResponseWriter, r *http.Request) {
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

////////////////////////////////// FIN API USUARIOS //////////////////////////////

func crearCookie(w http.ResponseWriter, nombre string, toki string) {
	fmt.Println("entra en cookie")
	expiration := time.Now().Add(365 * 24 * time.Hour)
	cookie := http.Cookie{Name: "micookie", Value: toki, Expires: expiration}
	http.SetCookie(w, &cookie)
	fmt.Println("sale cookie2")
	// expire := time.Now().Add(time.Minute * 15)
	// cookie := http.Cookie{
	// 	Name:    "mi cookie",
	// 	Value:   "toki",
	// 	Expires: expire,
	// 	//	HttpOnly: true,
	// }
	// http.SetCookie(w, &cookie)
}

// func check(err) {
// 	if err != nil {
// 		panic(err.Error())
// 	}
// }

// ////516
// fmt.Println("*************************************")
// for _, cookie := range r.Cookies() {
// 	fmt.Println("Found a cookie named:*************************************", cookie.Name)
// }

// cookie, err := r.Cookie("token")
// if err != nil {
// 	fmt.Printf("Cant find cookie :/\r\n")
// 	return
// }
// fmt.Println("Found a cookie named2:*************************************", cookie.Name)
