CREATE DATABASE todo;
USE todo;
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  creatorNickname VARCHAR(255) NOT NULL
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
