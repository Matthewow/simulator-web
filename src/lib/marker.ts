import {
	type BufferGeometry,
	CircleGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	type Object3D,
	SRGBColorSpace,
	type Texture,
	TextureLoader,
} from "three";
import { PLYLoader } from "three/examples/jsm/Addons.js";
import type { VehicleStatus, SubwayStatus } from "./types";

const DEFAULT_MATERIAL = new MeshBasicMaterial({ color: 0x000000 });

export const createCircleMesh = () => {
	const markerMesh = new Mesh(new CircleGeometry(20, 32), DEFAULT_MATERIAL);
	markerMesh.rotation.x = -Math.PI / 2;

	return markerMesh;
};

export const MARKER_COLOR_MAP = {
	BOARDING: "#555599",
	EMPTY: "#555555",
	OFFLINE: "#999999",
	RUNNING: "#559955",
	PICKUP: "#ffff55",
} as {
	[key in VehicleStatus | SubwayStatus]: string;
};

const SVG_NAMES = ["subway", "private car", "taxi", "bus"];
const DEFAULT_PLY_GEOMETRIES = new Map<string, BufferGeometry>();
let MATCAP_TEXTURE: Texture | null = null;

export const createPLYGroup = (type: string) => {
	const geometry = DEFAULT_PLY_GEOMETRIES.get(type.toLocaleLowerCase());

	if (!geometry) {
		throw new Error("Unsupported types");
	}

	const material = new MeshMatcapMaterial({
		matcap: MATCAP_TEXTURE as Texture,
	});

	return new Mesh(geometry, material);
};

export const setGroupMaterialColorByStatus = (
	object: Object3D,
	status: VehicleStatus | SubwayStatus,
) => {
	const rgbStr = MARKER_COLOR_MAP[status];

	((object as Mesh).material as MeshBasicMaterial).color.set(rgbStr);
};

export const prepareTexture = async () => {
	const textureLoader = new TextureLoader();
	MATCAP_TEXTURE = await textureLoader.loadAsync("./matcap_3.png");
	MATCAP_TEXTURE.colorSpace = SRGBColorSpace;
};

export const preparePLYs = async () => {
	const loader = new PLYLoader();

	for (const name of SVG_NAMES) {
		const res = await loader.loadAsync(`/${name}.ply`);
		switch (name) {
			case "taxi": {
				res.scale(5, 5, 5);
				break;
			}
			case "private car": {
				res.scale(10, 10, 10);
				break;
			}
			case "bus": {
				res.scale(15, 15, 15);
				break;
			}
			case "subway": {
				res.scale(2, 2, 2);
				break;
			}
		}

		DEFAULT_PLY_GEOMETRIES.set(name, res);
	}
};
