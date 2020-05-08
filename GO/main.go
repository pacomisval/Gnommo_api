package main

import (
	"crypto/hmac"
	"crypto/md5"
	"regexp"

	//	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var nombreImagenBook string
var extension string
var lastId int64

type Libro struct {
	Id          string `json:"id"`
	Nombre      string `json:"nombre"`
	Isbn        string `json:"isbn"`
	Genero      string `json:"genero"`
	Descripcion string `json:"descripcion"`
	Portada     string `json:"portada"`
	IdAutor     string `json:"idAutor"`

	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type Libro2 struct {
	Id      string `json:"id"`
	Nombre  string `json:"nombre"`
	Isbn    string `json:"isbn"`
	IdAutor string `json:"idAutor"`

	Portada string `json:"first_name"`
}

type Autor struct { //TODO MODIFICADO
	Id              string `json:"id"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name"`
	Nacionalidad    string `json:"nacionalidad"`
	FechaNacimiento string `json:"fechaNacimiento"`
}

type Usuario struct {
	Id       string `json:"id"`
	Nombre   string `json:"nombre"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Rol      string `json:"rol"`
	Tok      string `json:"tok"`
	Codigo   string `json:"codigo"`
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

var db *sql.DB
var err error

const maxUploadSize = 100 * 1024 // 100 KB
const uploadPath = "./../src/assets/images/book"

func main() {
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/newlibrary")
	if err != nil {
		panic(err.Error())
	}

	defer db.Close()

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
	router.HandleFunc("/api/email/{email}", encontrarEmail).Methods("GET")
	router.HandleFunc("/api/filtrar", obtenerLibrosPorAutor).Methods("GET")
	router.HandleFunc("/api/buscarLibro", obtenerLibro).Methods("GET")

	router.HandleFunc("/api/usuarios", getUsuarios).Methods("GET")
	router.HandleFunc("/api/usuarios/{id}", getUsuario).Methods("GET")
	router.HandleFunc("/api/usuarios", postUsuario).Methods("POST")
	router.HandleFunc("/api/usuarios/{id}", putUsuario).Methods("PUT")
	router.HandleFunc("/api/usuarios/{id}", deleteUsuario).Methods("DELETE")

	router.HandleFunc("/api/registro", postUsuario).Methods("POST")
	router.HandleFunc("/api/login", login).Methods("POST")

	router.HandleFunc("/api/recoveryPass1", recuperarPass).Methods("POST")
	router.HandleFunc("/api/recoveryPass2", verificarCodigo).Methods("POST")
	router.HandleFunc("/api/recoveryPass3", nuevoPassword).Methods("POST")

	router.HandleFunc("/api/upload", uploadFileHandler).Methods("POST")

	log.Print("Server started on localhost:8000 ..........")

	log.Fatal(http.ListenAndServe(":8000", handlers.CORS(
		handlers.AllowCredentials(),
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "Accept", "Accept-Language"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS"}),
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

////////////////////////////////////////////////////////////////////////////////////////
///////////////////  PASO 1  RECUPERAR CONTRASEÑA  //////////////////////////////////////////

func recuperarPass(w http.ResponseWriter, r *http.Request) {
	var value bool
	var id string

	fmt.Println("Dentro de recuperarPass")

	useru := &Claims{}
	err := json.NewDecoder(r.Body).Decode(useru)

	fmt.Println("Valor de err: ", err)

	if err != nil {
		var resp = map[string]interface{}{"status": false, "message": "Invalid request"}
		json.NewEncoder(w).Encode(resp)
	}

	value, id = findUsuarioByEmail(useru.Nombre, useru.Email)

	fmt.Println("Valor de user.Nombre: ", useru.Nombre)
	fmt.Println("Valor de user.Email: ", useru.Email)
	fmt.Println("Valor de useru: ", useru)
	fmt.Println("")
	fmt.Println("Valor de value en recuperarPass: ", value)
	fmt.Println("Valor de id en recuperarPass: ", id)
	fmt.Println("Valor de w en recuperarPass: ", w)

	if value {

		clave := crearClaveAleatoria(id, useru.Nombre, useru.Email)
		fmt.Println("valor de clave: ", clave)

		sendMailRecoveryPassword(clave)
		fmt.Println("Se ha enviado un correo")
	}

	json.NewEncoder(w).Encode(value)

}

func obtenerLibrosPorAutor(w http.ResponseWriter, r *http.Request) {
	fmt.Println("LLEga rafa:-----------------------")
	params := r.URL.Query()

	fmt.Println("params ", params)

	nombre1, ok := params["firstParameter"]
	apellido1, ok := params["secondParameter"]
	nombre := nombre1[0]
	apellido := apellido1[0]
	//nombre := strings.Join(nombre1, " ")
	//apellido := strings.Join(apellido1, " ")

	fmt.Println("nombre: ", nombre)
	fmt.Println("Apellido:" + apellido)

	if err != nil {
		panic(err)
	}
	fmt.Println("nombre1 ", nombre1)

	fmt.Println("apellido1 ", apellido1)
	//fmt.Println(strings.Join(nombre1, " "))
	//fmt.Println(strings.Join(apellido1, " "))
	fmt.Println("el ok ", ok)

	fmt.Println("-----------------------1")
	var libros []Libro2
	var autor Autor
	rows, err2 := db.Query("SELECT id FROM autor WHERE first_name=? AND last_name=?", &nombre, &apellido)

	if (err) != nil {
		panic(err.Error())
	}
	if err2 != nil {
		fmt.Println("error2 rows ", err2)
	}
	defer rows.Close()

	for rows.Next() {

		err := rows.Scan(&autor.Id)
		if err != nil {
			fmt.Println("error:::: ", err)
		}
		fmt.Println("autor Id:::::: ", autor.Id)
		fmt.Println("rows:::::", rows)
	}
	fmt.Println("autor Id:::::: ", autor.Id)
	if err2 != nil {
		fmt.Println("error2 ", err2)

	}

	result, err := db.Query("SELECT * FROM books WHERE idAutor = ? ", &autor.Id) //BUG
	if err != nil {
		fmt.Println("error3 ", err)
	}

	defer result.Close()

	for result.Next() {
		var libro Libro2
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada) //BUG
		if err != nil {
			fmt.Println("error4 ", err)
		}
		libros = append(libros, libro)
	}
	json.NewEncoder(w).Encode(libros)

	fmt.Println("ESTO ES GET LIBRO POR AUTOR....................sad")
}

func obtenerLibro(w http.ResponseWriter, r *http.Request) {
	fmt.Println("LLEga rafa:-----------------------")
	params := r.URL.Query()

	fmt.Println("params ", params)

	nombre1, ok := params["firstParameter"]
	nombre := "%" + nombre1[0] + "%"

	fmt.Println("nombre: ", nombre)
	fmt.Println("nombre1 ", nombre1)
	fmt.Println("el ok", ok)

	if err != nil {
		panic(err)
	}

	var libros []Libro2

	result, err := db.Query("SELECT * FROM books WHERE nombre LIKE ?", &nombre) //BUG
	if err != nil {
		fmt.Println("error3 ", err)
	}

	defer result.Close()

	for result.Next() {
		var libro Libro2
		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.IdAutor, &libro.Portada) //BUG
		if err != nil {
			fmt.Println("error4 ", err)
		}
		libros = append(libros, libro)
	}
	json.NewEncoder(w).Encode(libros)

	fmt.Println("ESTO ES GET LIBRO POR AUTOR....................sad")
}

func encontrarEmail(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Entra a encontrarEmail rafa ")
	params := mux.Vars(r)
	email := params["email"]
	fmt.Println(email)
	rows, err2 := db.Query("Select count(*) FROM usuarios where email like ?", &email)
	var count int
	if err2 != nil {
		count = 1
	}
	defer rows.Close()
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			fmt.Println(err)
		}
	}

	json.NewEncoder(w).Encode(count)
}

func findUsuarioByEmail(user, mail string) (bool, string) {
	ok := false

	fmt.Println("Valor de mail en findUsuarioByEmail: ", mail)
	fmt.Println("Valor de user en findUsuarioByEmail: ", user)

	var id string
	var nombre string
	var email string

	result, err := db.Query("SELECT id, nombre, email FROM usuarios WHERE email like ?", &mail)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()

	for result.Next() {
		var usuario Usuario
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Email)
		if (err) != nil {
			panic(err.Error())
		}

		id = usuario.Id
		nombre = usuario.Nombre
		email = usuario.Email
	}

	resultNombre := user == nombre
	resultEmail := mail == email

	fmt.Println("")
	fmt.Println("Valor de resultNombre: ", resultNombre)
	fmt.Println("Valor de resultEmail: ", resultEmail)
	fmt.Println("")
	fmt.Println("Valor de nombre: ", nombre)
	fmt.Println("Valor de email: ", email)
	fmt.Println("Valor de user: ", user)
	fmt.Println("Valor de mail: ", mail)
	fmt.Println("Valor de id: ", id)
	fmt.Println("")

	if resultNombre && resultEmail {
		ok = true
		// llamamos a metodo enviarCodigo
		fmt.Println("Valor de ok: ", ok)
	}

	return ok, id
}

func crearClaveAleatoria(id, nombre, email string) string {

	expireAt := time.Now().Add(time.Hour * 50).Unix()
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

	c := []rune(tokenString)
	codigo := string(c[124:134])

	fmt.Println("Valor de tokenString: ", tokenString)
	fmt.Println("Valor de codigo: ", codigo)

	guardarToken(codigo, id)

	return codigo
}

func sendMailRecoveryPassword(body string) { // pasar variables con el from, pass, to
	// Entra en esta url: https://support.google.com/accounts/answer/6010255
	// "Hay que habilitar en mi cuenta el modo inseguro"
	// Entra aqui: Si tu cuenta tiene activado el acceso de aplicaciones poco seguras
	// Haz click en el link:  Acceso de aplicaciones poco seguras
	// La opción debe estar así: Permitir el acceso de aplicaciones poco seguras: SÍ

	from := "Aqui tu email"                      // tu email
	pass := "Aqui tu contraseña de gmail"        // tu contraseña de gmail o google
	to := "Aqui el email a quien quieres enviar" // email del usuario que renueva la contraseña

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: Hello Mari. Introduce este código\n\n" +
		body

	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))

	if err != nil {
		log.Printf("smtp error: %s", err)
		return
	}

	log.Print("sent, dentro de send")
}

///////////////  FIN PASO 1  RECUPERAR CONTRASEÑA  /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
///////////////  PASO 2  RECUPERAR CONTRASEÑA  ////////////////////////////////

func verificarCodigo(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Dentro de verificarCodigo")

	code := &Usuario{}
	err := json.NewDecoder(r.Body).Decode(code)

	fmt.Println("Valor de err: ", err)
	fmt.Println("Valor de code.Codigo: ", code.Codigo)

	if err != nil {
		var resp = map[string]interface{}{"status": false, "message": "Invalid request"}
		json.NewEncoder(w).Encode(resp)
	}

	result, err := db.Query("SELECT * FROM usuarios WHERE codigo like ?", code.Codigo)
	if err != nil {
		panic(err.Error())
	}
	defer result.Close()

	var usuario Usuario
	for result.Next() {

		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
		if (err) != nil {
			panic(err.Error())
		}
	}
	resultCodigo := usuario.Codigo == code.Codigo
	fmt.Println("Valor de usuario.codigo: ", usuario.Codigo)
	fmt.Println("Valor de resultCodigo: ", resultCodigo)

	id := usuario.Id
	nombre := usuario.Nombre
	passwd := usuario.Password
	email := usuario.Email
	rol := usuario.Rol
	tok := usuario.Tok
	codigo := ""

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ?, codigo = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(id, nombre, passwd, email, rol, tok, codigo, id)
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("ESTO ES ELIMINAR CODIGO")

	json.NewEncoder(w).Encode(resultCodigo)
}

/////////////////  FIN PASO 2  RECUPERAR CONTRASEÑA  ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////  PASO 3  RECUPERAR CONTRASEÑA  ///////////////////////////////

func nuevoPassword(w http.ResponseWriter, r *http.Request) {
	fmt.Println("")
	fmt.Println("Dentro de nuevoPassword:")
	var ok = true

	user := &Usuario{}
	err := json.NewDecoder(r.Body).Decode(user)

	if err != nil {
		//var resp = map[string]interface{}{"status": false, "message": "Invalid request"}
		ok = false
		json.NewEncoder(w).Encode(ok)
	}
	fmt.Println("nuevoPassword valor de user.Email: ", user.Email)
	fmt.Println("nuevoPassword valor de user.Password: ", user.Password)

	result, err := db.Query("SELECT * FROM usuarios WHERE email like ?", user.Email)
	if err != nil {
		//panic(err.Error())
		ok = false
		json.NewEncoder(w).Encode(ok)
	}
	defer result.Close()

	var usuario Usuario
	for result.Next() {

		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
		if (err) != nil {

		}
	}
	id := usuario.Id
	nombre := usuario.Nombre
	password := usuario.Password
	email := usuario.Email
	rol := usuario.Rol
	tok := usuario.Tok
	codigo := usuario.Codigo

	newPassword := encriptarPass(user.Password, user.Email)
	fmt.Println("nuevoPassword valor de newPassword: ", newPassword)
	fmt.Println("nuevoPassword valor de password: ", password)

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ?, codigo = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())

	}

	_, err = stmt.Exec(id, nombre, newPassword, email, rol, tok, codigo, id)
	if err != nil {
		//panic(err.Error())
		ok = false
		json.NewEncoder(w).Encode(ok)
	}

	//var resp = map[string]interface{}{"status": "0k", "message": "New password created"}
	json.NewEncoder(w).Encode(ok)

	fmt.Println("ESTO ES NUEVA CONTRASEÑA RECUPERADA")

}

////////////////////////////  FIN PASO 3  RECUPERAR CONTRASEÑA  //////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  LOGIN ///////////////////////////////////////////////////////

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

	crearCookie(w, r, value)

	fmt.Println("valor de value: ", value)

	json.NewEncoder(w).Encode(value)
	fmt.Println("El valor de W: ", w)

	return
}

//////////////////////////////////////////  TOKEN  ////////////////////////////////////////

func encontrarUsuario(password, email string) Value {

	fmt.Println("DENTRO DE ENCONTRAR USUARIO")

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
		err := result.Scan(&usuario.Id, &usuario.Nombre, &usuario.Password, &usuario.Email, &usuario.Rol, &usuario.Tok, &usuario.Codigo)
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

	fmt.Println("ESTO ES ID EN ENCONTRAR USUARIO: ", id)

	if resultVacio {

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

	fmt.Println("")
	fmt.Println("value de id: ", id)
	fmt.Println("value de nombre: ", nombre)
	fmt.Println("value de rol: ", rol)
	fmt.Println("value de tokenstring: ", tokenString)
	fmt.Println("")

	return value
}

func guardarToken(token, id string) {

	var iddb string
	var nombre string
	var passwd string
	var email string
	var rol string
	var tok string
	var codigo string

	result, err := db.Query("SELECT * FROM usuarios WHERE id = ?", &id)
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

	length := len(token)
	fmt.Println("El tamaño de length: ", length)
	if length >= 11 {
		iddb = usuario.Id
		nombre = usuario.Nombre
		passwd = usuario.Password
		email = usuario.Email
		rol = usuario.Rol
		tok = token
		codigo = usuario.Codigo
	} else {
		iddb = usuario.Id
		nombre = usuario.Nombre
		passwd = usuario.Password
		email = usuario.Email
		rol = usuario.Rol
		tok = usuario.Tok
		codigo = token
	}

	stmt, err := db.Prepare("UPDATE usuarios SET id = ?, nombre = ?, password = ?, email = ?, rol = ?, tok = ?, codigo = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}

	_, err = stmt.Exec(iddb, nombre, passwd, email, rol, tok, codigo, id)
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

func crearToken(id, nombre, email string) string {

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

	guardarToken(tokenString, id)

	return tokenString
}

func verificarToken(tknStr, SecretKey string) int {
	resp := 0 // ok
	claims := &Claims{
		// Email: SecretKey,
	}

	tkn, err := jwt.ParseWithClaims(tknStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})
	fmt.Println("valor de tkn: ", tkn)
	fmt.Println("Valor del token: ", tknStr)
	fmt.Println("Valor de claims: ", claims)
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

/////////////////////////////////////////////  COOKIES  //////////////////////////////////////////////////////

func crearCookie(w http.ResponseWriter, r *http.Request, value Value) {

	 I := base64.StdEncoding.EncodeToString([]byte(value.Id))
	//I := value.Id
	N := base64.StdEncoding.EncodeToString([]byte(value.Nombre))
	R := base64.StdEncoding.EncodeToString([]byte(value.Rol))
	T := value.Token
	// T := base64.StdEncoding.EncodeToString([]byte(value.Token))

	expiration := time.Now().Add(time.Minute * 5)

	cookie1 := &http.Cookie{
		Name:     "tokensiI",
		Value:    I,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false,
	}
	http.SetCookie(w, cookie1)
	r.AddCookie(cookie1)

	cookie2 := &http.Cookie{
		Name:     "tokensiN",
		Value:    N,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false,
	}
	http.SetCookie(w, cookie2)
	r.AddCookie(cookie2)

	cookie3 := &http.Cookie{
		Name:     "tokensiR",
		Value:    R,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false,
	}
	http.SetCookie(w, cookie3)
	r.AddCookie(cookie3)

	cookie4 := &http.Cookie{
		Name:     "tokensiT",
		Value:    T,
		Path:     "/",
		Expires:  expiration,
		HttpOnly: false,
		//SameSite: Lax,
		Secure: false,
	}
	http.SetCookie(w, cookie4)
	r.AddCookie(cookie4)
}

func eliminarCookie(w http.ResponseWriter, r *http.Request) {
	expiration := time.Now().Add(time.Minute - 1)

	cookie1 := &http.Cookie{
		Name:    "tokensiI",
		Value:   "",
		Path:    "/",
		Expires: expiration,
	}
	http.SetCookie(w, cookie1)
	r.AddCookie(cookie1)

	cookie2 := &http.Cookie{
		Name:    "tokensiN",
		Value:   "",
		Path:    "/",
		Expires: expiration,
	}
	http.SetCookie(w, cookie2)
	r.AddCookie(cookie2)

	cookie3 := &http.Cookie{
		Name:    "tokensiR",
		Value:   "",
		Path:    "/",
		Expires: expiration,
	}
	http.SetCookie(w, cookie3)
	r.AddCookie(cookie3)

	cookie4 := &http.Cookie{
		Name:    "tokensiT",
		Value:   "",
		Path:    "/",
		Expires: expiration,
	}
	http.SetCookie(w, cookie4)
	r.AddCookie(cookie4)
}

func verificarCookies(w http.ResponseWriter, r *http.Request) int {
	c, err := r.Cookie("tokensiT")
	if err != nil {
		fmt.Println("ERROR cookie tokensiT: ", err)
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Println("Error de StatusUnauthorized")
			return 1
		}
	}
	tknStr := c.Value

	d, err := r.Cookie("tokensiI")
	if err != nil {
		fmt.Println("ERROR cookie tokensiI: ", err)
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			fmt.Println("Error de StatusUnauthorized")
			return 1

		}
	}
	idStr := d.Value
	fmt.Println("Valor de idStr: linea 950 ", idStr)
////////////////////////////// DECODE COOKIE ID ////////////////////////
	base64.StdEncoding.EncodeToString([]byte(idStr))
	data, err := base64.StdEncoding.DecodeString(idStr)
    if err != nil {
        return 0
	}
	ident := string(data)

	fmt.Println("Valor de data: linea 976 ", data)
	fmt.Println("Valor de ident: linea 977 ", ident)
	fmt.Println("Valor de ident: linea 977 ", string(ident))

////////////////////////////////////////////////////////////////////////
	result, err := db.Query("SELECT * FROM usuarios WHERE id = ?", ident)
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
	secret := usuario.Email

	fmt.Println("Id en putLibro: ", idStr)
	fmt.Println("Token en putLibro: ", tknStr)
	fmt.Println("Valor de secret: ", secret)

	resp := verificarToken(tknStr, secret)

	if resp == 0 {
		token := crearToken(usuario.Id, usuario.Nombre, usuario.Email)

		var value Value
		value.Id = usuario.Id
		value.Nombre = usuario.Nombre
		value.Rol = usuario.Rol
		value.Token = token

		eliminarCookie(w, r)
		crearCookie(w, r, value)
	}

	fmt.Println("Esto es verificar cuki ", resp)

	return resp
}

///////////////////////////////// FIN ENCRIPTACION ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  UPLOAD FILES ///////////////////////////////////////

func uploadFileHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == "GET" {
		t, _ := template.ParseFiles("upload.gtpl")
		t.Execute(w, nil)
		fmt.Println("valor de t: ", t)
		return
	}
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		fmt.Printf("Could not parse multipart form: %v\n", err)
		renderError(w, "CANT_PARSE_FORM", http.StatusInternalServerError)
		return
	}

	// parse and validate file and post parameters
	file, fileHeader, err := r.FormFile("uploadFile")
	fmt.Println("------------------------------", fileHeader.Filename)
	if err != nil {
		renderError(w, "INVALID_FILE", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Get and print out file size
	fmt.Println("1-----------------------------", fileHeader.Filename)
	fileSize := fileHeader.Size
	fmt.Printf("File size (bytes): %v\n", fileSize)
	// validate file size
	if fileSize > maxUploadSize {
		renderError(w, "FILE_TOO_BIG", http.StatusBadRequest)
		fmt.Printf("Error3")
		return
	}
	fmt.Println("2-----------------------------", fileHeader.Filename)
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		renderError(w, "INVALID_FILE", http.StatusBadRequest)
		fmt.Printf("Error2")
		return
	}
	fmt.Println("3-----------------------------", fileHeader.Filename)

	// check file type, detectcontenttype only needs the first 512 bytes
	detectedFileType := http.DetectContentType(fileBytes)
	switch detectedFileType {
	case "image/jpeg", "image/jpg":
	case "image/gif", "image/png":
	case "application/pdf":
		break
	default:
		renderError(w, "INVALID_FILE_TYPE", http.StatusBadRequest)
		fmt.Printf("Error1")
		return
	}
	// fileName := randToken(12)

	//	nombreImagenBook := keyVal["fileName"]

	fileName := nombreImagenBook
	fmt.Println("6-----------------------------", fileHeader.Filename)
	fileEndings, err := mime.ExtensionsByType(detectedFileType)
	if err != nil {
		renderError(w, "CANT_READ_FILE_TYPE", http.StatusInternalServerError)
		fmt.Printf("Error")

		return
	}
	fmt.Println("7-----------------------------", fileHeader.Filename)
	extension = fileEndings[0]
	newPath := filepath.Join(uploadPath, fileName+fileEndings[0])
	fmt.Printf("FileType: %s, File: %s\n", detectedFileType, newPath)

	fmt.Println("8-----------------------------", newPath)

	// write file
	newFile, err := os.Create(newPath)
	if err != nil {
		renderError(w, "CANT_WRITE_FILE", http.StatusInternalServerError)
		fmt.Println("valor de w1: ", w)
		return
	}
	fmt.Println("9-----------------------------", fileHeader.Filename)

	defer newFile.Close()

	if _, err := newFile.Write(fileBytes); err != nil || newFile.Close() != nil {
		renderError(w, "CANT_WRITE_FILE", http.StatusInternalServerError)
		fmt.Println("valor de w2: ", w)
		return
	}
	fmt.Println("Todo ha ido bien. Has llegado al final !!")
	w.Write([]byte("SUCCESS"))
	putImgBook()

}

func renderError(w http.ResponseWriter, message string, statusCode int) {

	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte(message))
}

// func randToken(len int) string {
// 	b := make([]byte, len)
// 	rand.Read(b)
// 	return fmt.Sprintf("%x", b)
// }

//////////////////////////////  FIN UPLOAD FILES  /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// INICIO API LIBROS ////////////////////////////

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

	result, err := db.Query("SELECT b.id, b.nombre, b.isbn,b.genero,b.descripcion, b.idAutor,b.portada, a.first_name, a.last_name FROM books b INNER JOIN autor a ON b.idAutor = a.id")
	if err != nil {
		panic(err.Error())
	}

	defer result.Close()

	for result.Next() {
		var libro Libro

		err := result.Scan(&libro.Id, &libro.Nombre, &libro.Isbn, &libro.Genero, &libro.Descripcion, &libro.IdAutor, &libro.Portada, &libro.FirstName, &libro.LastName)
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

	///////////////////////////////////////////////
	resp := verificarCookies(w, r)

	if resp != 0 {
		return
	}
	///////////////////////////////////////////////

	//stmt, err := db.Prepare("INSERT INTO books(id, nombre, isbn, idAutor) VALUES(?,?,?,?)")
	// stmt, err := db.Prepare("INSERT INTO books(nombre, isbn, idAutor) VALUES(?,?,?)")

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
	nombre := keyVal["titulo"]
	isbn := keyVal["isbn"]
	idAutor := keyVal["id_author"] //mirar si falla FK es idAutor
	//	extension := keyVal["extension"]
	// _, err = stmt.Exec(&nombre, &isbn, &idAutor)
	res, err := db.Exec("INSERT INTO books(nombre, isbn, idAutor) VALUES(?,?,?)", &nombre, &isbn, &idAutor)
	if err != nil {
		panic(err.Error())
	}
	lastId, err := res.LastInsertId()
	if err != nil { //no encuentra ultima id
		println("Error:", err.Error())
	}

	// si no hay error guarda el fichero y su nombre
	println("LastInsertId:", lastId)
	nombreImagenBook = strconv.FormatInt(lastId, 10)
	println(" nombreImagenBook:::::::::", nombreImagenBook)
	// nombreImagenBook = strconv.FormatInt(id, 10)
	// println(" nombreImagenBook:::::::::", nombreImagenBook)

	// portada := strconv.FormatInt(id, 10) + "." + extension
	// println("portada:", portada)
	// stmt, err := db.Prepare("UPDATE books SET portada = ? WHERE id = ?")
	// if err != nil {
	// 	panic(err.Error())
	// }
	// _, err = stmt.Exec(&portada, &id)
	// if err != nil {
	// 	panic(err.Error())
	// }
	//	fmt.Fprintf(w, "Se a añadido un nuevo libro")

	fmt.Println("ESTO ES POST LIBRO")

}

///// insertar nombre imagen libro //////
func putImgBook() {

	portada := nombreImagenBook + extension
	println("nombre:", nombreImagenBook)
	println("ext:", extension)
	println("portada:", portada)
	id, err := strconv.ParseInt(nombreImagenBook, 10, 64)
	if err != nil {
		panic(err.Error())
	}
	println("Id:", id)
	stmt, err := db.Prepare("UPDATE books SET portada = ? WHERE id = ?")
	if err != nil {
		panic(err.Error())
	}
	_, err = stmt.Exec(&portada, &id)
	if err != nil {
		panic(err.Error())
	}
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
	nombreImagenBook = params["id"]
	println(" nombreImagenBook:::::::::", nombreImagenBook)
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
		err := result.Scan(&autor.Id, &autor.FirstName, &autor.LastName, &autor.Nacionalidad, &autor.FechaNacimiento)
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

	stmt, err := db.Prepare("INSERT INTO autor(id, first_name, last_name, nationality, date) VALUES (?,?,?,?,?)")
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
	nationality := clave["nationality"]
	date := clave["date"]
	_, err = stmt.Exec(&id, &firstName, &lastName, &nationality, &date)
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

	stmt, err := db.Prepare("UPDATE autor SET nationality = ?, date = ?,  first_name = ?, last_name = ? WHERE id = ?")
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
	nuvoNationality := key["nationality"]
	nuevoDate := key["date"]

	_, err = stmt.Exec(&nuevoDate, &nuvoNationality, &nuevoFirstName, &nuevoLastName, params["id"])
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

////////////////////////////////// FIN API USUARIOS //////////////////////////////
func nombreArchivo(nombre int64) int64 {
	println("nombreArchivo::::::::::::::", nombre)
	return nombre
}

func comprobarCampos(campo, nombrecampo string) bool {
	var estado bool
	fmt.Println("El valor de campo:", campo)
	fmt.Println("El valor de nombrecampo:", nombrecampo)

	switch nombrecampo {
	case "mail":
		fmt.Println("Has llegado al mail")

		var match3, err = regexp.MatchString(`^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$`, campo)
		err = err
		if match3 == false {
			estado = false

		} else {
			estado = true
		}

	case "passDB":
		var match2, err = regexp.MatchString(`^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,250}$`, campo)
		err = err
		if match2 == false {
			estado = false

		} else {
			estado = true
		}

	case "firstname":

		var match4, err = regexp.MatchString(`^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$`, campo)
		err = err

		if match4 == false {
			fmt.Println("Entrado a firstname, esta mal ")
			estado = false
		} else {
			estado = true
		}

	case "lastname":
		var match5, err = regexp.MatchString(`^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$`, campo)
		err = err
		if match5 == false {
			estado = false
		} else {
			estado = true
		}

	case "isbn":
		var match1, err = regexp.MatchString(`^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})↵
		[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)↵
		(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$`, campo)
		err = err
		if match1 == false {
			estado = false
		} else {
			estado = true
		}

	default:
		fmt.Println("Has llegado al default")
		estado = false
	}

	return estado

}
