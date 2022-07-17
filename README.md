# C/C++ Project Generator ( cpg ) #

A mini project which scaffolds simple C/C++ workspace

## How to use this project ##

- Clone this repository
- If you have node and npm installed run `npm link` else add it to your environment variables

## Usage ##
- run `cpg --help` to see the usage
- run `cpg create <app-name>` to create a C or C++ workspace (eg. Visual Studio Solution)
- run `cpg add <app-name>` to add a new project to the C or C++ workspace

## FAQ ##
- So far this project uses premake to build workspaces go to [premake](https://premake.github.io/) for help there

## Features to Add ##
- Sub generators to abstract the code more.
- Generate different code if the project is a Console, Dynamic or Static library
- Able to generate window application