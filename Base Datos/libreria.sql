-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-04-2020 a las 08:24:20
-- Versión del servidor: 10.4.10-MariaDB
-- Versión de PHP: 7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `libreria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autor`
--

CREATE TABLE `autor` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `autor`
--

INSERT INTO `autor` (`id`, `first_name`, `last_name`) VALUES
(5, 'Pepe', 'Romero'),
(6, 'Ana', 'Martinez'),
(7, 'Ramon', 'Saez'),
(8, 'Raul', 'Martin'),
(11, 'Alberto', 'Perez'),
(12, 'Enrique', 'Palu'),
(13, 'Sebas', 'Carrillo'),
(16, 'Pancho', 'Villa'),
(33, 'hsfgjsfgjsfj', 'znfgxgm');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `isbn` varchar(15) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `idAutor` int(11) NOT NULL,
  `portada` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `books`
--

INSERT INTO `books` (`id`, `nombre`, `isbn`, `idAutor`, `portada`) VALUES
(19, 'El caballero se pasea por la calle', '1313131313', 7, ''),
(20, 'La cena de caza perruna  manchega', '3737373737', 5, ''),
(21, 'Ya no soy bienvenido', '1515151515', 5, ''),
(22, 'Tu ves a comerte las bolitas', '1616161616', 8, ''),
(23, 'Que te ha parecido el viaje al futuro', '1717171717', 6, ''),
(24, 'Venga malotes fuera de aqui', '1818181818', 7, ''),
(25, 'Nos vemos el el camino', '1919191919', 7, ''),
(26, 'Hemos encontrado un hueco', '2020202020', 7, ''),
(28, 'La comida fue a las dos y cuarto', '4040404040', 8, ''),
(31, 'Probando probando breiko breiko', '4141414141', 7, ''),
(33, 'Comenzando por el principio', '', 5, ''),
(34, 'Vamos ha comer todo el dia', '', 5, ''),
(35, 'No entres que voy a fregar', '0', 5, ''),
(38, 'Rapido que se acaba todo', '3131313131', 5, ''),
(39, 'Bahamas esta desierta', '3232323232', 6, ''),
(40, 'Apologia del teerremoto', '3434343434', 6, ''),
(41, 'Capricho del destino', '3535353535', 6, ''),
(80, 'La enciclopedia creativa de Pons', '2424242424', 5, ''),
(81, 'Libro desconocido codigo isbn', 'adf hadf', 12, ''),
(83, 'La conquista de América', '2525252525', 5, ''),
(84, 'La conquista de América', '2525252525', 13, ''),
(85, 'Ves a la compra luego a las 3', '2626262626', 5, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(70) DEFAULT NULL,
  `password` varchar(250) NOT NULL,
  `email` varchar(100) NOT NULL,
  `rol` enum('user','admin','root') NOT NULL,
  `tok` varchar(250) DEFAULT NULL,
  `codigo` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `password`, `email`, `rol`, `tok`, `codigo`) VALUES
(11, 'Lucas', '44c8904ed2d01d37f6be11f084b049654dba24d9d3b4068802c51cf4cb4eeb6f', 'lucas@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6MCwiTm9tYnJlIjoiTHVjYXMiLCJFbWFpbCI6IiIsImV4cCI6MTU4NDg4MTc2N30.mz5vq8HOGDHZDrsKqrl-NnIPEEjofwLAMqUhoYJgl4Y', ''),
(12, 'Paula', '52cf60ef57a7f3649e4387dc2ce5f11338c54cec17e655aee550233075467b3b', 'paula@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6MCwiTm9tYnJlIjoiUGF1bGEiLCJFbWFpbCI6IiIsImV4cCI6MTU4NDg4MjAxOH0.3AQH7wBXQaFZ46ECLXO1hm8QXneaR9Uzy88i215wGho', ''),
(36, 'Picachu', '5888823d2ab5dcd0eb69ebeef1c8e420c9692a4b2568e9c67ed03407ba1dc937', 'picachu@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJQaWNhY2h1IiwiRW1haWwiOiJwaWNhY2h1QG1haWwuY29tIiwiZXhwIjoxNTg3NDMwMTE0fQ.8RhsJ3VjFv5TB24i-PFR1eaMcK5r2C4chHQ_lseycK0', ''),
(37, 'Rober', 'a00b04b0aad7fe0d397a6aad67e56d332192bd784ee7f339a3c445166b4f1bcf', 'rober@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJSb2JlciIsIkVtYWlsIjoicm9iZXJAbWFpbC5jb20iLCJleHAiOjE1ODUxNDgwNTd9.eluoQbCcVjSna49wrjh3sRn1vwLYOl3d_NuCq-6vFAQ', ''),
(40, 'Canelo', 'c8eb05e2b2342bb50907f1242732df5aa286993e4c9cfa82e0d24ef5fa17cbde', 'canelo@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJDYW5lbG8iLCJFbWFpbCI6ImNhbmVsb0BtYWlsLmNvbSIsImV4cCI6MTU4NzM5NDkxNX0.omcWMaLqKriiPGyYjelayBH2OdyYWnobVveOxBIQZL8', ''),
(47, 'Fenix', 'f1242d79b1206c3dcc3aee085161891f462f64879a254a16a792784123fcd2f4', 'fenix@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJGZW5peCIsIkVtYWlsIjoiZmVuaXhAbWFpbC5jb20iLCJleHAiOjE1ODU1NTUzNzB9.tlYlsPfG3se1PfHJBHMtJFWpgXrI9MepuwFKf_DqLxI', ''),
(55, 'Pipiolo', '6734221495fa7783b1409e1f36593d3f1d78c9ad2682b9b6bc008ea79f490424', 'pipiolo@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJQaXBpb2xvIiwiRW1haWwiOiJwaXBpb2xvQG1haWwuY29tIiwiZXhwIjoxNTg3NDI1NzIxfQ.DPipp-o2sRJNEiz2rN_rzIiPqUpZBLYlVVAWkfiYJVE', ''),
(57, 'Felipe', '0e738032fd14a5733ff4123dd7d317906205b9b8a97a190580b741861290884d', 'felipe@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJGZWxpcGUiLCJFbWFpbCI6ImZlbGlwZUBtYWlsLmNvbSIsImV4cCI6MTU4NzUwNTQwNX0.qDRZYm7B9CPDJt4IuXfKMPkc4pQHoyLG3WFAKGkGh4k', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `autor`
--
ALTER TABLE `autor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_books_idAutor` (`idAutor`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `autor`
--
ALTER TABLE `autor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_idAutor` FOREIGN KEY (`idAutor`) REFERENCES `autor` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
