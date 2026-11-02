Option Explicit

Dim shell, files, folder, service, processes, process, scriptPath, killed
Set files = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
folder = LCase(files.GetParentFolderName(WScript.ScriptFullName))
scriptPath = LCase(folder & "\lancer_kobra.py")
killed = False

Set service = GetObject("winmgmts:\\.\root\cimv2")
Set processes = service.ExecQuery("SELECT * FROM Win32_Process WHERE Name='python.exe' OR Name='pythonw.exe'")
For Each process In processes
  If Not IsNull(process.CommandLine) Then
    If InStr(LCase(process.CommandLine), scriptPath) > 0 Then
      process.Terminate
      killed = True
    End If
  End If
Next

If killed Then
  shell.Popup "Kobra a été arrêté.", 3, "Kobra", 64
Else
  shell.Popup "Kobra n'était pas en cours d'exécution.", 3, "Kobra", 64
End If

Set processes = Nothing
Set service = Nothing
Set files = Nothing
Set shell = Nothing
