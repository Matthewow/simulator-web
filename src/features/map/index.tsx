import { useEffect, useRef, useMemo } from "react";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { Loader } from "@googlemaps/js-api-loader";
import { BoxGeometry, MathUtils, Mesh, MeshMatcapMaterial } from "three";
import GLOBAL_CONFIG from "../config.json";

const MapProvider = () => {
    const mapElementRef = useRef<HTMLDivElement | null>(null)
    const mapConfig = useMemo<google.maps.MapOptions>(() => {
        return {
            center: {
                lng: -122.343787,
                lat: 47.607465,
            },
            mapId: GLOBAL_CONFIG.map.mapId,
            zoom: 15,
            heading: 45,
            tilt: 67,

        }
    }, [])



    useEffect(() => {
        new Loader({
            apiKey: GLOBAL_CONFIG.map.apiKey,
            version: "beta",
            libraries: [],
        }).importLibrary("maps").then(() => {
            const map = new google.maps.Map(mapElementRef.current!, mapConfig)
            const overlay = new ThreeJSOverlayView({ map });

            const box = new Mesh(
                new BoxGeometry(100, 200, 500),
                new MeshMatcapMaterial()
            );

            // set position at center of map
            const pos = overlay.latLngAltitudeToVector3(mapConfig.center!);
            box.position.copy(pos);

            // set position vertically
            box.position.z = 25;

            // add box mesh to the scene
            overlay.scene.add(box);

            // rotate the box using requestAnimationFrame
            const animate = () => {
                box.rotateZ(MathUtils.degToRad(0.1));

                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        })




    }, [mapElementRef, mapConfig])
    return <div id="map" ref={mapElementRef}></div >
}

export default MapProvider