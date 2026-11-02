@echo off
cd /d "%~dp0"
py -3 lancer_kobra.py
if errorlevel 1 pause
