package cookie

import (
	"net/http"
	"time"
	"fmt"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/pacomisval/Gnommo_api/GO/encriptacion/token"
)

type Value struct {
	Id     string `json:"id"`
	Nombre string `json:"Nombre"`
	Rol    string `json:"rol"`
	Token  string `json:"token"`
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

func crearCookie(w http.ResponseWriter, r *http.Request, value Value) {

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

	result, err := db.Query("SELECT * FROM usuarios WHERE id = ?", idStr)
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

	resp := VerificarToken(tknStr, secret)

	if resp == 0 {
		token := CrearToken(usuario.Id, usuario.Nombre, usuario.Email)

		var value Value
		value.Id = usuario.Id
		value.Nombre = usuario.Nombre
		value.Rol = usuario.Rol
		value.Token = token

		eliminarCookie(w, r)
		crearCookie(w, r, value)
	}

	fmt.Println("Esto es la respuesta de resp en PutLibro: ", resp)

	return resp
}
