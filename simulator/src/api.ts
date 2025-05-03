const defaultBaseUrl = "http://localhost:5001";

async function setProject(projectDir: string, baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/project`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ projectDir }),
	});
	if (!response.ok) {
		console.error("Failed to set project:", response.status);
	}
	return response.json();
}

async function getSimulationStatus(baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/simulation/status`, {
		method: "GET",
	});
	if (!response.ok) {
		console.error("Failed to get simulation status:", response.status);
	}
	return response.json();
}

type ConfigParams = {
	"simulation.tInitial": number;
	"simulation.tEnd": number;
	"simulation.simulateIterations": number;
	"simulation.taxiDriverSamplePercentage": number;
	"simulation.taxiOrderSamplePercentage": 0;
	"simulation.privateCarsSamplePercentage": 500000;
};

async function setConfig(params: ConfigParams, baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/config`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ params }),
	});
	if (!response.ok) {
		console.error("Failed to set config:", response.status);
	}
	return response.json();
}

async function startSimulation(baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/simulation/start`, {
		method: "POST",
	});
	if (!response.ok) {
		console.error("Failed to start simulation:", response.status);
	}
	return response.json();
}

async function stopSimulation(baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/simulation/stop`, {
		method: "POST",
	});
	if (!response.ok) {
		console.error("Failed to stop simulation:", response.status);
	}
	return response.json();
}

async function getSimulationStatistics(baseUrl = defaultBaseUrl) {
	const response = await fetch(`${baseUrl}/simulation/statistics`, {
		method: "GET",
	});
	if (!response.ok) {
		console.error("Failed to get simulation statistics:", response.status);
	}
	return response.json();
}
