@ECHO OFF
PUSHD %~dp0\..\
call libs\premake5\bin\premake5.exe vs2022
POPD
PAUSE
