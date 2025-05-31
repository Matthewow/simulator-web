import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";

import SECRET from "@/assets/secret.json";
import {
	type Group,
	Mesh,
	type Object3DEventMap,
	OrthographicCamera,
	Scene,
	WebGLRenderer,
} from "three";
import type { Dataset } from "./dataset";
import TimelineTimer from "./timer";
import { listenNamedEvent } from "./event";
import type { PlayStatus } from "@/store";
import { calcRailwayLayer } from "./railway";
import ViewLayer from "./view_layer";
import {
	createBusGroup,
	createPrivateCatGroup,
	createSubwayGroup,
	createTaxiGroup,
} from "./models";
import { MARKER_COLOR_MAP, setGroupMaterialColorByStatus } from "./marker";

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

export const initVehicleSampleLayer = async () => {
	const canvas = document.getElementById("ui") as HTMLCanvasElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	const renderer = new WebGLRenderer({
		canvas,
		alpha: true,
		antialias: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio);

	renderer.setSize(width, height, false);

	renderer.autoClear = false;

	const scene = new Scene();
	const camera = new OrthographicCamera(
		-width / 2,
		width / 2,
		height / 2,
		-height / 2,
		-1000,
		1000,
	);
	camera.position.y = 10;
	camera.lookAt(0, 0, 0);

	const taxis: Group<Object3DEventMap>[] = [];
	const buses: Group<Object3DEventMap>[] = [];
	const privateCars: Group<Object3DEventMap>[] = [];
	const subways: Group<Object3DEventMap>[] = [];

	const rotateX = (-Math.PI * 1) / 4;


	// set up taxi example
	for (const status of ["DELIVERY", "PICKUP", "EMPTY", "CRUISING"] as const) {
		const taxi = createTaxiGroup();
		taxi.rotateX(rotateX);
		taxi.rotateY(Math.PI / 2.5);
		setGroupMaterialColorByStatus(taxi, status);
		scene.add(taxi);
		taxis.push(taxi);

	}

	for (const status of ["RUNNING", "BOARDING"] as const) {
		const bus = createBusGroup();
		bus.rotateX(rotateX);
		bus.rotateY(Math.PI / 2.5);
		setGroupMaterialColorByStatus(bus, status);
		scene.add(bus);
		buses.push(bus);
	}

	for (const status of ["DELIVERY"] as const) {
		const privateCar = createPrivateCatGroup();
		privateCar.rotateX(rotateX);
		privateCar.rotateY(Math.PI / 2.5);
		setGroupMaterialColorByStatus(privateCar, status);
		scene.add(privateCar);
		privateCars.push(privateCar);
	}

	for (const status of ["RUNNING", "BOARDING"] as const) {
		const subway = createSubwayGroup();
		subway.rotateX(rotateX);
		subway.rotateY(Math.PI / 2.5);
		setGroupMaterialColorByStatus(subway, status);
		scene.add(subway);
		subways.push(subway);
	}


	const lineHeight = 50;
	const lineStart = 0;
	const updateSamplesPosition = (width: number, height: number) => {
		subways.forEach((subway, index) => {
			subway.position.set(
				width / 2 - 150 + index * 100,

				0,
				-height / 2 + lineHeight + lineStart,
			);
		});

		buses.forEach((bus, index) => {
			bus.position.set(
				width / 2 - 170 + index * 60,

				0,
				-height / 2 + 2 * lineHeight + lineStart,
			);
		});

		taxis.forEach((taxi, index) => {
			taxi.position.set(
				width / 2 - 180 + index * 45,

				0,
				-height / 2 + 3 * lineHeight + lineStart,
			);
		});

		privateCars.forEach((privateCar, index) => {
			privateCar.position.set(
				width / 2 - 180 + index * 50,
				0,
				-height / 2 + 4 * lineHeight + lineStart,
			);
		});
	};

	updateSamplesPosition(width, height);

	window.addEventListener("resize", () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;

		renderer.setSize(width, height, false);

		updateSamplesPosition(width, height);

		camera.left = -width / 2;
		camera.right = width / 2;
		camera.top = height / 2;
		camera.bottom = -height / 2;
		camera.updateProjectionMatrix();

		ViewLayer.instance.paths.traverse((child) => {
			if (child instanceof Mesh) {
				child.material.uniforms.resolution.value.set(width, height);
			}
		})
	});

	function animate() {
		requestAnimationFrame(animate);

		renderer.render(scene, camera);
	}

	animate();
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

	calcRailwayLayer(overlay);

	scene.add(ViewLayer.instance.privateCars);
	scene.add(ViewLayer.instance.buses);
	scene.add(ViewLayer.instance.taxis);
	scene.add(ViewLayer.instance.subway);
	scene.add(ViewLayer.instance.paths);
	scene.add(ViewLayer.instance.stations);

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
