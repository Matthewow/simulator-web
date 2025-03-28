import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";

import SECRET from "@/assets/secret.json";
import { AmbientLight, Mesh, Scene } from "three";
import type { Dataset } from "./dataset";
import TimelineTimer from "./timer";
import { listenNamedEvent } from "./event";
import type { PlayStatus } from "@/store";
import { appendRailwayLayer } from "./railway";

const MAP_CONFIG = {
	center: {
		lng: 114.177216,
		lat: 22.302711,
	},
	mapId: SECRET.map.mapId,
	zoom: 15,
	heading: 0,
	tilt: 45,
	clickableIcons: false,
	disableDefaultUI: true,
	keyboardShortcuts: false,
};

let mapOverlay: ThreeJSOverlayView | null = null;
export const timer = new TimelineTimer();

export const initGoogleMap = async () => {
	const mapElement = document.getElementById("map");
	if (!mapElement) return;

	const loader = new Loader({
		apiKey: SECRET.map.apiKey,
		version: "beta",
		libraries: [],
	});

	await loader.importLibrary("core");
	await loader.importLibrary("geometry");

	const scene = new Scene();

	const map = new google.maps.Map(mapElement, MAP_CONFIG);
	const overlay = new ThreeJSOverlayView({
		anchor: MAP_CONFIG.center,
		upAxis: "Y",
		map,
		scene,
		animationMode: "always",
	});

	mapOverlay = overlay;
};

listenNamedEvent("render_dataset", (e) => {
	const dataset = e?.detail as Dataset;
	if (
		dataset.idRouteMap.size === 0 &&
		dataset.sequence.length === 0 &&
		!mapOverlay
	)
		return;

	const overlay = mapOverlay as ThreeJSOverlayView;
	const scene = overlay.scene as Scene;

	scene.add(new AmbientLight(0xffffff, 5));

	const meshes = scene.children.filter((child) => child instanceof Mesh);
	for (const mesh of meshes) {
		scene.remove(mesh);
		mesh.material.dispose();
		mesh.geometry.dispose();
	}

	timer.reset();

	appendRailwayLayer(overlay);

	for (const [_id, vehicle] of dataset.idRouteMap) {
		scene.add(vehicle.marker);
	}

	const animate = () => {
		const requestedTime = timer.getElapsedTime();

		for (const [_id, vehicle] of dataset.idRouteMap) {
			vehicle.updateMarker(requestedTime, overlay);
		}

		requestAnimationFrame(animate);
	};

	animate();
});

listenNamedEvent("play_status_changed", (e) => {
	switch (e?.detail as PlayStatus) {
		case "FastForward":
			timer.timeScale = 10;
			break;
		case "Play":
			timer.timeScale = 1;
			break;
		case "Pause":
			timer.timeScale = 0;
	}
});
