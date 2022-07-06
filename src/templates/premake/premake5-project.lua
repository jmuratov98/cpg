project "<%- appName %>"
	location "<%- appName %>"
	kind "<%- kind %>"
	language "<%- language %>"
	cppdialect "<%- language %>17"
	staticruntime "on"

	targetdir	("bin/" .. outputdir .. "/%{prj.name}")
	objdir		("bin-obj/" .. outputdir .. "/%{prj.name}")

	files {
		<% if(language == "C++") { %>
		"%{prj.name}/src/**.cpp",
		<% } else if(language == "C") { %>
		"%{prj.name}/src/**.c",
		<% } %>
		"%{prj.name}/src/**.h",
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