Option Explicit

Dim shell, files, folder, pythonLauncher, command
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
folder = files.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = folder
pythonLauncher = shell.ExpandEnvironmentStrings("%WINDIR%") & "\pyw.exe"
command = """" & pythonLauncher & """ -3 """ & folder & "\lancer_kobra.py"""
shell.Run command, 0, False
Set files = Nothing
Set shell = Nothing
