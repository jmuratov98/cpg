@ECHO OFF
PUSHD %~dp0\..\
call lib\premake5\bin\premake5.exe vs2022
POPD
PAUSE
