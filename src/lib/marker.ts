import {
	type Box3,
	CircleGeometry,
	Color,
	DoubleSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	ShapeGeometry,
} from "three";
import { SVGLoader, type SVGResult } from "three/examples/jsm/Addons.js";
import type { VehicleStatus, SubwayStatus } from "./types";

const DEFAULT_MATERIAL = new MeshBasicMaterial({ color: 0x000000 });

export const createCircleMesh = () => {
	const markerMesh = new Mesh(new CircleGeometry(20, 32), DEFAULT_MATERIAL);
	markerMesh.rotation.x = -Math.PI / 2;

	return markerMesh;
};

export const MARKER_COLOR_MAP = {
	BOARDING: "#000099",
	EMPTY: "#000000",
	OFFLINE: "#999999",
	RUNNING: "#009900",
	PICKUP: "#ffff00",
} as {
	[key in VehicleStatus | SubwayStatus]: string;
};

const SVG_NAMES = ["subway", "private car", "taxi", "bus"];
const DEFAULT_SVG_GEOMETRIES = new Map<string, ShapeGeometry[]>();

export const createSVGGroup = (type: string) => {
	const group = new Group();
	const geometries = DEFAULT_SVG_GEOMETRIES.get(type.toLocaleLowerCase());

	if (!geometries) {
		throw new Error("Unsupported types");
	}

	const material = new MeshBasicMaterial({
		color: new Color(0x000000),
		side: DoubleSide,
		depthWrite: false,
	});

	for (const geometry of geometries as ShapeGeometry[]) {
		const mesh = new Mesh(geometry, material);
		group.add(mesh);
	}

	return group;
};

export const setGroupMaterialColorByStatus = (
	group: Group,
	status: VehicleStatus | SubwayStatus,
) => {
	const rgbStr = MARKER_COLOR_MAP[status];
	for (const mesh of group.children) {
		((mesh as Mesh).material as MeshBasicMaterial).color.set(rgbStr);
	}
};

const generateSVGGroup = (data: SVGResult) => {
	const paths = data.paths;

	const geometries = paths.flatMap((path) => {
		const shapes = SVGLoader.createShapes(path);
		const geometries = shapes.map((shape) => {
			const geometry = new ShapeGeometry(shape);
			geometry.computeBoundingBox();
			geometry.translate(
				-(geometry.boundingBox as Box3).max.x * 0.5,
				-(geometry.boundingBox as Box3).max.y * 0.5,
				-(geometry.boundingBox as Box3).max.z * 0.5,
			);

			geometry.rotateX(Math.PI / 2);
			geometry.scale(0.05, 0.05, 0.05);

			return geometry;
		});

		return geometries;
	});

	return geometries;
};

export const prepareSVGs = async () => {
	const loader = new SVGLoader();
	for (const name of SVG_NAMES) {
		const res = await loader.loadAsync(`/${name}.svg`);
		DEFAULT_SVG_GEOMETRIES.set(name, generateSVGGroup(res));
	}
};
