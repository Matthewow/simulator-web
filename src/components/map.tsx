import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import {
	Mesh,
	MeshBasicMaterial,
	BufferGeometry,
	BufferAttribute,
	Scene,
	type Vector3,
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

		let curTimeIndex = 0;
		let initTimeInMili: number | null = null;
		const currentTimeStamp = dataset.sequence?.[curTimeIndex];

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
			if (vehicle.route.has(currentTimeStamp)) {
				const marker = markerTemplate.clone();

				const geoPosition = vehicle.route.get(currentTimeStamp)
					?.pos as GeoPosition;
				const glPosition = overlay.latLngAltitudeToVector3(
					geoPosition,
				) as Vector3;
				marker.position.copy(glPosition);
				scene.add(marker);
				vehicle.marker = marker;
			}
		}

		let shouldCalcFrameDiff = false;
		let lastTimeInMili = 0;
		const animate = (time: number) => {
			//Calculate frame diff
			if (shouldCalcFrameDiff) {
				shouldCalcFrameDiff = false;
				console.log(`key frame diff = ${time - lastTimeInMili}`);
			}

			//Record Init time
			if (!initTimeInMili) {
				initTimeInMili = time;

				shouldCalcFrameDiff = true;
				lastTimeInMili = time;
			}

			const newTimeIndex = Math.floor((time - initTimeInMili) / 5000);
			if (
				newTimeIndex > curTimeIndex &&
				newTimeIndex < dataset.sequence?.length
			) {
				shouldCalcFrameDiff = true;
				lastTimeInMili = time;

				curTimeIndex = newTimeIndex;
				const currentTimeStamp = dataset.sequence?.[curTimeIndex];

				for (const [_id, vehicle] of dataset.idRouteMap) {
					if (vehicle.route.has(currentTimeStamp)) {
						const marker = vehicle.marker;

						const geoPosition = vehicle.route.get(currentTimeStamp)
							?.pos as GeoPosition;
						const glPosition = overlay.latLngAltitudeToVector3(
							geoPosition,
						) as Vector3;
						marker?.position.copy(glPosition);
					}
				}
			}
			requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}, [dataset]);

	return <div id="map" style={{ flex: 1 }} ref={mapElementRef} />;
};

export default MapProvider;
