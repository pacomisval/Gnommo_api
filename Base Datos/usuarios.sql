-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-05-2020 a las 19:26:26
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
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `rol` set('user','client','admin') CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `tok` varchar(200) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `codigo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `password`, `email`, `rol`, `tok`, `codigo`) VALUES
(1, 'Pascual', 'fbc7e652faf858f07fd9bffbdf5cdb275fd27ec311f46e86b3e222a6385740c1', 'pascual@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJQYXNjdWFsIiwiRW1haWwiOiJwYXNjdWFsQG1haWwuY29tIiwiZXhwIjoxNTg4Njc1NDM4fQ.GCcRd_oWkFh-vRm0CVOV3LNkvLta30UlvZSl8nzyk1A', '0'),
(2, 'Salva', '192439eb79479183f0281b31f251189f35a8137b32984bde1fc0939672fc097d', 'salva@mail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJTYWx2YSIsIkVtYWlsIjoic2FsdmFAbWFpbC5jb20iLCJleHAiOjE1ODgzNTY4NjJ9.g3ftiVNkhJJyF4WBUKX4wRBO-fy5iMO0e7r8LRKxh1s', ''),
(3, 'Alberto', 'bed2ae162fd402874d167ddd5b0e48444afd8d13270bc6966381f34a80e7575c', 'alberto@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJBbGJlcnRvIiwiRW1haWwiOiJhbGJlcnRvQG1haWwuY29tIiwiZXhwIjoxNTg4MjQ0MTc1fQ.f9b94LttejFmUOpS2Hl6mQz631-40pP0grD65n8Ch6U', '0'),
(4, 'Carmela', 'e0e374bd9f2e033d1882e84a79e6459c80fc97bea1a7bb9a9c5905cd49111859', 'carmela@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJDYXJtZWxhIiwiRW1haWwiOiJjYXJtZWxhQG1haWwuY29tIiwiZXhwIjoxNTg4MjQ0MzUyfQ.C4WZx_gFICObAuluSLMTlFWegl3WRvyOgMUIg2Tc_Z0', '0'),
(7, 'jose', 'ad1037561b4abbf0a54c85b2ae7a587c97499272444e891d86091b6dfd71bc45', 'jose@mail.com', 'user', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJqb3NlIiwiRW1haWwiOiJqb3NlQG1haWwuY29tIiwiZXhwIjoxNTg5MDQzODUzfQ.G9tqN6Rn2gEADExqfVjQGM1hQuMbG6fqimv3pGUDk1U', ''),
(8, 'Usuario', 'd62c74c449ab30e5218d317622dc7bf30599a3cce128ac895ab5b9c996e15ccb', 'user@user.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJVc3VhcmlvIiwiRW1haWwiOiJ1c2VyQHVzZXIuY29tIiwiZXhwIjoxNTg5MDUyNTYzfQ._n-zc5AuQG02CJFJvVyBYW_ZfA22W-SEwiu3fgQloOA', ''),
(9, 'admin', '0cb40b3f300b0f804f77102cbe9354386f874c8bce5713dd4a45dc47456d360e', 'admin@gmail.com', 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOb21icmUiOiJhZG1pbiIsIkVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiZXhwIjoxNTg4OTI0MDgwfQ.nrsURZL037twKQwh6jo00wfwwku33FqzVlLadp8brOg', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
