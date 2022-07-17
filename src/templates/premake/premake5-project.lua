project "<%- appName %>"
	kind "<%- kind %>"
	language "<%- language %>"
	cppdialect "<%- language %>17"
	staticruntime "on"

	targetdir	("%{wks.location}/bin/" .. outputdir)
	objdir		("%{wks.location}/bin-obj/" .. outputdir .. "/%{prj.name}")

	files {
		<% if(language == "C++") { %>
		"src/**.cpp",
		<% } else if(language == "C") { %>
		"src/**.c",
		<% } %>
		"src/**.h",
		"include/**.h",
	}

	defines {
	}

	includedirs {
		"include",
		"src",
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