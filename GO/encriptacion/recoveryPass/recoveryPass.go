package recoveryPass

import (
	"net/http"
	"fmt"
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"
	"github.com/pacomisval/Gnommo_api/GO/encriptacion/token"
)

type Claims struct {
	//Id     uint
	Nombre string
	Email  string
	*jwt.StandardClaims
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

var db *sql.DB
var err error

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