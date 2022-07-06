project "<%- appName %>"
	location "<%- appName %>"
	kind "<%- kind %>"
	language "<%- language %>"
	cppdialect "<%- language %>17"
	staticruntime "on"

	targetdir	("bin/" .. outputdir .. "/%{prj.name}")
	objdir		("bin-obj/" .. outputdir .. "/%{prj.name}")

	pchheader "pch.h"
	pchsource "<%- appName %>/src/pch.cpp"

	files {
		"%{prj.name}/src/**.cpp",
		"%{prj.name}/include/**.h",
	}

	defines {
	}

	includedirs {
		"%{prj.name}/include",
		"%{prj.name}/src",
	}

	links {
	}

	filter "configurations:Debug"
		defines "NDEBUG"
		runtime "Debug"
		symbols "on"

	filter "configurations:Release"
		runtime "Release"
		optimize "on"