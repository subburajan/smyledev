@ECHO OFF

SET APP_PATH=%~dp0../..

CD %APP_PATH%

nohup npm start &
