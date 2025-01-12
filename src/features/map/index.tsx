import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import { BoxGeometry, Mesh, MeshMatcapMaterial, Scene } from "three";
import SECRET from "../secret.json";

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

			const box = new Mesh(
				new BoxGeometry(100, 200, 500),
				new MeshMatcapMaterial(),
			);

			const pos = overlay.latLngAltitudeToVector3(mapConfig.center);
			box.position.copy(pos);
			box.position.z = 400;

			scene.add(box);

			const animate = () => {
				box.rotateX(Math.PI / 360);

				requestAnimationFrame(animate);
			};
			requestAnimationFrame(animate);
		};

		prepareMap();
	}, [mapConfig]);
	return <div id="map" style={{ flex: 1 }} ref={mapElementRef} />;
};

export default MapProvider;
