workspace "<%- appName %>"
    architecture "x86_64"
    startproject "<%- appName %>"

    configurations { "Debug", "Release" }

    flags { "MultiProcessorCompile" }

outputdir = "%{cfg.buildcfg}-%{cfg.system}-%{cfg.architecture}"

include "<%- appName %>"