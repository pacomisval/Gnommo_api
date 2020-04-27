package token

import (
	"time"
	"fmt"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/dgrijalva/jwt-go"
	"crypto/hmac"
	"crypto/md5"
	
	"crypto/sha256"
	"io"
	"encoding/hex"

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

type Claims struct {
	//Id     uint
	Nombre string
	Email  string
	*jwt.StandardClaims
}

var db *sql.DB
var err error

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

func CrearToken(id, nombre, email string) string {

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

func VerificarToken(tknStr, SecretKey string) int {
	resp := 0 // ok
	claims := &Claims{}

	tkn, err := jwt.ParseWithClaims(tknStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})
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