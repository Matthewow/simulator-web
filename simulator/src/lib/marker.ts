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
	Group,
	Plane,
	PlaneGeometry,
} from "three";
import { PLYLoader } from "three/examples/jsm/Addons.js";
import type { VehicleStatus, SubwayStatus } from "./types";
import {
	createBusGroup,
	createPrivateCatGroup,
	createSubwayGroup,
	createTaxiGroup,
} from "./models";

const DEFAULT_MATERIAL = new MeshBasicMaterial({ color: 0xee0000 });

export const createCircleMesh = () => {
	const downwardsCircle = new Group();
	const downwardsLCircle = new Mesh(
		new CircleGeometry(10, 32, 0, Math.PI),
		new MeshBasicMaterial({
			color: 0xffffff,
		}),
	);
	//upwardsLCircle.position.y = 10;
	const downwardsSCircle = new Mesh(
		new CircleGeometry(6, 32, 0, Math.PI),
		DEFAULT_MATERIAL,
	);
	//upwardsSCircle.position.y = 10;
	downwardsSCircle.position.z = 0.003;
	downwardsCircle.add(downwardsLCircle);
	downwardsCircle.add(downwardsSCircle);
	downwardsCircle.position.z = 0.003;
	downwardsCircle.position.y = -11;

	const upwardsCircle = downwardsCircle.clone();
	upwardsCircle.rotation.z = Math.PI;
	upwardsCircle.position.y = 11;

	const plane = new Mesh(
		new PlaneGeometry(4, 22),
		new MeshBasicMaterial({
			color: 0xffffff,
		}),
	);
	plane.position.z = 0.008;

	const group = new Group();
	const markerMesh = new Mesh(new CircleGeometry(18, 32), DEFAULT_MATERIAL);
	markerMesh.position.z = 0.002;
	group.add(markerMesh);
	group.add(downwardsCircle);
	group.add(upwardsCircle);
	group.add(plane);
	group.rotation.x = -Math.PI / 2;

	return group;
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
	if (type === "Taxi") {
		return createTaxiGroup();
	} else if (type === "Bus") {
		return createBusGroup();
	} else if (type === "Private Car") {
		return createPrivateCatGroup();
	} else if (type === "subway") {
		return createSubwayGroup();
	} else {
		const geometry = DEFAULT_PLY_GEOMETRIES.get(type.toLocaleLowerCase());

		if (!geometry) {
			throw new Error("Unsupported types");
		}

		const material = new MeshMatcapMaterial({
			// matcap: MATCAP_TEXTURE as Texture,
		});

		return new Mesh(geometry, material);
	}
};

export const setGroupMaterialColorByStatus = (
	object: Object3D,
	status: VehicleStatus | SubwayStatus,
) => {
	const rgbStr = MARKER_COLOR_MAP[status];
	if (object instanceof Mesh) {
		((object as Mesh).material as MeshBasicMaterial).color.set(rgbStr);
	} else if (object instanceof Group) {
		((object.children[0] as Mesh).material as MeshBasicMaterial).color.set(
			rgbStr,
		);
	}
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
