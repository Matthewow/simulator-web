import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import {
	Mesh,
	MeshBasicMaterial,
	BufferGeometry,
	BufferAttribute,
	Scene,
	Vector3,
} from "three";
import SECRET from "../assets/secret.json";
import { useAppstore } from "../store";
import type { GeoPosition } from "../lib/dataset";

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

		let initTimeInMili: number | null = null;
		const initTimestamp = dataset.sequence?.[0];

		const vertices = new Float32Array([
			0, 0, 0.75, 1.0, 0, 1.0, 0, 0, -1.0, -1.0, 0, 1.0,
		]);

		const indices = [0, 1, 2, 0, 2, 3];
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(vertices, 3));
		geometry.setIndex(indices);

		const material = new MeshBasicMaterial({ color: 0x0000ff });
		const markerTemplate = new Mesh(geometry, material);
		markerTemplate.scale.set(15, 15, 15);

		for (const [_id, vehicle] of dataset.idRouteMap) {
			if (vehicle.route.has(initTimestamp)) {
				const marker = markerTemplate.clone();

				const geoPosition = vehicle.route.get(initTimestamp)
					?.pos as GeoPosition;
				const glPosition = overlay.latLngAltitudeToVector3(
					geoPosition,
				) as Vector3;
				marker.position.copy(glPosition);

				const nextTimeIndex = 1;
				const nextTimestamp = dataset.sequence?.[nextTimeIndex];
				const nextGeoPosition = vehicle.route.get(nextTimestamp)?.pos;
				if (initTimestamp && nextTimestamp && nextGeoPosition) {
					const heading = google.maps.geometry.spherical.computeHeading(
						geoPosition,
						nextGeoPosition,
					);

					marker.rotation.y = -(heading / 180) * Math.PI;
				}

				scene.add(marker);
				vehicle.marker = marker;
			}
		}

		let lastTime: number | null = null;
		const animate = (time: number) => {
			if (lastTime) {
				console.log(`Frame diff is ${time - lastTime}`);
				lastTime = time;
			}
			if (!initTimeInMili) {
				//Record Init time
				initTimeInMili = time;
				lastTime = time;
			}
			const rebasedTime = time - initTimeInMili;

			const curTimeIndex = Math.floor(rebasedTime / 5000);
			const nextTimeIndex = curTimeIndex + 1;

			const curTimestamp = dataset.sequence?.[curTimeIndex];
			const nextTimestamp = dataset.sequence?.[nextTimeIndex];
			if (!curTimestamp && !nextTimestamp) {
				console.log("Run out of data");
				return;
			}

			for (const [_id, vehicle] of dataset.idRouteMap) {
				const route = vehicle.route;

				const curGeoPosition = route.get(curTimestamp)?.pos;
				const nextGeoPosition = route.get(nextTimestamp)?.pos;

				if (curGeoPosition && nextGeoPosition) {
					const curGlPosition = overlay.latLngAltitudeToVector3(curGeoPosition);
					const nextGlPosition =
						overlay.latLngAltitudeToVector3(nextGeoPosition);

					const diff = {
						x: nextGlPosition.x - curGlPosition.x,
						z: nextGlPosition.z - curGlPosition.z,
					};

					const simulatedGlPosition = new Vector3(
						curGlPosition.x + (diff.x * (rebasedTime % 5000)) / 5000,
						curGlPosition.y,
						curGlPosition.z + (diff.z * (rebasedTime % 5000)) / 5000,
					);

					vehicle.marker?.position.copy(simulatedGlPosition);

					if (
						curGeoPosition.lat !== nextGeoPosition.lat &&
						curGeoPosition.lng !== nextGeoPosition.lng
					) {
						const heading = google.maps.geometry.spherical.computeHeading(
							curGeoPosition,
							nextGeoPosition,
						);

						(vehicle.marker as Mesh).rotation.y = -(heading / 180) * Math.PI;
					}
				}
			}

			requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}, [dataset]);

	return <div id="map" className="flex-1" ref={mapElementRef} />;
};

export default MapProvider;
