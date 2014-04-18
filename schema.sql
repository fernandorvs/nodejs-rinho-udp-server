/*
SQLyog Ultimate v10.42 
MySQL - 5.6.10-log : Database - rinhonode
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`rinhonode` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `rinhonode`;

/*Table structure for table `actions` */

DROP TABLE IF EXISTS `actions`;

CREATE TABLE `actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deviceId` varchar(20) NOT NULL,
  `reference` varchar(50) DEFAULT NULL,
  `cmd` varchar(200) DEFAULT NULL,
  `response` varchar(200) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0',
  `reint` tinyint(4) DEFAULT '5',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `idequipo` (`deviceId`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Table structure for table `tracks` */

DROP TABLE IF EXISTS `tracks`;

CREATE TABLE `tracks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deviceId` varchar(20) CHARACTER SET latin1 NOT NULL DEFAULT '',
  `reportType` varchar(2) DEFAULT NULL,
  `reportId` varchar(2) CHARACTER SET latin1 DEFAULT NULL,
  `gpsDateTime` datetime DEFAULT NULL,
  `reportDateTime` datetime DEFAULT NULL,
  `latitude` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `longitude` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  `course` decimal(5,2) DEFAULT NULL,
  `altitude` decimal(5,2) DEFAULT NULL,
  `ign` tinyint(1) DEFAULT NULL,
  `inputs` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  `outputs` varchar(10) CHARACTER SET latin1 DEFAULT NULL,
  `voltageMainPower` decimal(5,2) DEFAULT NULL,
  `odometer` int(11) DEFAULT NULL,
  `gpsPower` tinyint(1) DEFAULT NULL,
  `gpsFixMode` int(11) DEFAULT NULL,
  `gpsPdop` int(11) DEFAULT NULL,
  `gpsQtySat` int(11) DEFAULT NULL,
  `gpsAge` int(11) DEFAULT NULL,
  `gsmPower` tinyint(1) DEFAULT NULL,
  `gsmStatus` varchar(1) DEFAULT NULL,
  `gsmLevel` int(11) DEFAULT NULL,
  `txtMessage` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `msgNum` varchar(5) CHARACTER SET latin1 DEFAULT NULL,
  `sourcePacket` varchar(200) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deviceIdRangeReportDateTime` (`deviceId`,`reportDateTime`),
  KEY `deviceIdRangeCreated` (`deviceId`,`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
