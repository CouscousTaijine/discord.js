@echo off
setlocal
cd /d "%~dp0"
title Nebula Discord Bot

echo ========================================
echo          NEBULA DISCORD BOT
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js est introuvable.
  echo Installe Node.js 20 ou plus recent : https://nodejs.org/
  pause
  exit /b 1
)

if not exist "config.json" (
  echo Creation de config.json...
  copy "config.example.json" "config.json" >nul
  echo.
  echo Le fichier config.json vient d'etre cree.
  echo Remplis DISCORD_TOKEN, CLIENT_ID et GUILD_ID dans le Bloc-notes.
  start /wait "" notepad "config.json"
)

if not exist "node_modules" (
  echo Installation des dependances...
  call npm install
  if errorlevel 1 (
    echo [ERREUR] Echec de npm install.
    pause
    exit /b 1
  )
)

echo.
echo Enregistrement des commandes slash...
call npm run deploy
if errorlevel 1 (
  echo.
  echo [ERREUR] Impossible d'enregistrer les commandes.
  echo Verifie DISCORD_TOKEN et CLIENT_ID dans config.json.
  pause
  exit /b 1
)

echo.
echo Demarrage de Nebula...
echo Ferme cette fenetre pour arreter le bot.
echo.
call npm start
echo.
echo Nebula s'est arrete. Code : %errorlevel%
pause
