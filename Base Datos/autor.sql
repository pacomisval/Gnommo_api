-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-05-2020 a las 19:26:50
-- Versión del servidor: 10.4.6-MariaDB
-- Versión de PHP: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `newlibrary`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autor`
--

CREATE TABLE `autor` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `nacionalidad` varchar(50) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `fechaNacimiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `autor`
--

INSERT INTO `autor` (`id`, `first_name`, `last_name`, `nacionalidad`, `fechaNacimiento`) VALUES
(0, '', '', '', '0000-00-00'),
(1, 'No existe el autor', '', '', '0000-00-00'),
(2, 'Autor Desconocido', '', '', '0000-00-00'),
(4, 'jose', 'matias melchor', 'francia', '1991-08-16'),
(5, 'carmen', 'almudena grandes', 'españa', '1982-03-27'),
(10, 'Jose miguel', 'rufian marco', 'españa', '1996-08-08'),
(11, 'Benjamin', 'castro urdiales', 'españa', '2000-11-12'),
(12, 'Sara', 'bermejo varona', 'españa', '2001-10-23'),
(13, 'Emmanuel', 'carrere', 'Francia', '1964-02-12'),
(14, 'Terry ', 'pratcherr', 'Inglaterra', '1956-07-23'),
(15, 'Ken', 'Follet', 'Inglaterra', '1976-11-23'),
(16, 'Margaret', 'Atwood', 'Inglaterra', '1967-10-11'),
(17, 'Iris ', 'Murdoch', 'Irlanda', '1987-08-17'),
(18, 'Mircea', 'Cartarescu', 'Croacia', '1993-04-19'),
(19, 'Almudena', 'Grandes', 'España', '1975-12-20'),
(20, 'Gillermo', 'Arriaga', 'España', '1950-04-26'),
(21, 'Christian', 'Galvez', 'Argentina', '1988-06-02'),
(22, 'George', 'Orwell', 'Estados Unidos', '1987-07-23'),
(23, 'Eugenia', 'Perez Martinez', 'España', '1994-09-26'),
(24, 'Jason', 'R. Rich', 'Estados Unidos', '1969-09-22'),
(25, 'Jose', 'Dordoigne', 'Francia', '1971-11-30'),
(26, 'Astor ', 'De caso Parra', 'España', '1979-03-16'),
(27, 'Stephane', 'Combaudon', 'Canada', '1988-01-25'),
(28, 'Paula', 'Garcia Entrambasaguas', 'España', '1986-08-24'),
(29, 'Arnaldo', 'Perez Castaño', 'Uruguai', '1999-02-26'),
(30, 'Robert', 'C. Martin', 'España', '2000-01-23'),
(31, 'Francisco', 'Ibañez', 'España', '1956-08-14'),
(32, 'Kohei', 'Horikoshi', 'Japon', '1989-02-21'),
(33, 'Artur', 'Laperla', 'España', '1971-07-20'),
(34, 'David', 'Dominguezhenar', 'Belgica', '1986-09-06'),
(35, 'Akira', 'Toriyama', 'Japon', '1989-11-28'),
(36, 'Jose', 'Andres', 'España', '1959-02-18'),
(37, 'Jenny', 'Linford', 'Irlada', '1983-08-08'),
(38, 'Rodrigo', 'de la calle', 'Argentina', '1984-12-22'),
(39, 'Karlos', 'Arguiñano', 'España', '1949-12-22'),
(40, 'James', 'Rhodes', 'Inglaterra', '1996-08-12'),
(41, 'Alice', 'Oseman', 'Suecia', '1986-04-28'),
(42, 'Lauren', 'Palphreyman', 'Estados Unidos', '1969-05-18'),
(43, 'Nina', 'Kenwood', 'Estados Unidos', '1994-02-25'),
(44, 'Suzane', 'Collins', 'Inglaterra', '1982-04-20'),
(45, 'Dona', 'Leon', 'Colombia', '1976-03-24'),
(46, 'Juan', 'Gomez Jurado', 'Ecuador', '1979-09-28'),
(47, 'Carmen', 'Mola', 'España', '1995-06-24'),
(48, 'Javier', 'Castillo', 'España', '1968-01-24'),
(49, 'Alex', 'Michaelides', 'Francia', '1998-03-21'),
(50, 'Carlos', 'Garcia Portal', 'España', '1977-12-29'),
(51, 'Pedro ', 'Madera', 'España', '1968-08-23'),
(52, 'Sarah', 'Baxter', 'Suiza', '1991-12-31'),
(53, 'Christian ', 'Galvez', 'Portugal', '1969-09-21');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `autor`
--
ALTER TABLE `autor`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `autor`
--
ALTER TABLE `autor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
