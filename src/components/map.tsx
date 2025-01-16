import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import { Scene } from "three";
import SECRET from "../assets/secret.json";
import { useAppstore } from "../store";

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
			heading: 45,
			tilt: 67,
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

			const scene = new Scene();

			const map = new google.maps.Map(mapElementRef.current, mapConfig);
			const overlay = new ThreeJSOverlayView({
				map,
				scene,
				animationMode: "always",
			});

			mapOverlayRef.current = overlay;

			// const box = new Mesh(
			// 	new BoxGeometry(100, 200, 500),
			// 	new MeshMatcapMaterial(),
			// );

			// const pos = overlay.latLngAltitudeToVector3(mapConfig.center);
			// box.position.copy(pos);
			// box.position.z = 400;

			// scene.add(box);

			// const animate = () => {
			// 	box.rotateX(Math.PI / 360);

			// 	requestAnimationFrame(animate);
			// };
			// requestAnimationFrame(animate);
		};

		prepareMap();
	}, [mapConfig]);

	//render dataset once it is ready
	useEffect(() => {
		if (dataset.idRouteMap.size === 0 && dataset.sequence.length === 0) return;

		const animate = (time: number) => {};
		requestAnimationFrame(animate);
	}, [dataset]);

	return <div id="map" style={{ flex: 1 }} ref={mapElementRef} />;
};

export default MapProvider;
