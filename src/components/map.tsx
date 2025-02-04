import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import { Scene, Clock } from "three";
import SECRET from "../assets/secret.json";
import { useAppstore } from "../store";
import { listenNamedEvent } from "../lib/event";

const MapProvider = () => {
	const mapElementRef = useRef<HTMLDivElement | null>(null);
	const mapConfig = useMemo<google.maps.MapOptions>(() => {
		return {
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
	}, []);

	const mapOverlayRef = useRef<ThreeJSOverlayView | null>(null);

	const dataset = useAppstore((state) => state.dataset);

	// init google map and delegate scene to google map
	useEffect(() => {
		const prepareMap = async () => {
			if (!mapElementRef.current || !mapConfig.center) return;

			const loader = new Loader({
				apiKey: SECRET.map.apiKey,
				version: "beta",
				libraries: [],
			});

			await loader.importLibrary("core");
			await loader.importLibrary("geometry");

			const scene = new Scene();

			const map = new google.maps.Map(mapElementRef.current, mapConfig);
			const overlay = new ThreeJSOverlayView({
				anchor: mapConfig.center,
				upAxis: "Y",
				map,
				scene,
				animationMode: "always",
			});

			mapOverlayRef.current = overlay;
		};

		prepareMap();
	}, [mapConfig]);

	//render dataset once it is ready
	useEffect(() => {
		if (dataset.idRouteMap.size === 0 && dataset.sequence.length === 0) return;

		const overlay = mapOverlayRef.current as ThreeJSOverlayView;
		const scene = overlay.scene as Scene;

		const initTimestamp = dataset.sequence?.[0];

		for (const [_id, vehicle] of dataset.idRouteMap) {
			if (vehicle.route.has(initTimestamp)) {
				scene.add(vehicle.marker);
			}
		}

		let lastTime = 0;
		const timer = new Clock();
		const animate = () => {
			const requestedTime = timer.getElapsedTime();

			console.log(requestedTime - lastTime);
			lastTime = requestedTime;

			for (const [_id, vehicle] of dataset.idRouteMap) {
				vehicle.updateMarker(requestedTime, overlay);
			}

			requestAnimationFrame(animate);
		};

		animate();
	}, [dataset]);

	//Listen to play status change
	useEffect(() => {
		listenNamedEvent("play_status_changed", (e) => {
			console.log(e);
		});
	}, []);

	return <div id="map" className="w-full h-full" ref={mapElementRef} />;
};

export default MapProvider;
