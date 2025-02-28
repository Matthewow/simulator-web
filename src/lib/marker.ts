import {
	type Box3,
	BufferAttribute,
	BufferGeometry,
	CircleGeometry,
	Color,
	DoubleSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	ShapeGeometry,
} from "three";
import { SVGLoader, type SVGResult } from "three/examples/jsm/Addons.js";

const ARROW_GEOMETRY = (() => {
	const vertices = new Float32Array([
		0, 0, 0.75, 1.0, 0, 1.0, 0, 0, -1.0, -1.0, 0, 1.0,
	]);

	const indices = [0, 1, 2, 0, 2, 3];
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setIndex(indices);

	return geometry;
})();

const DEFAULT_MATERIAL = new MeshBasicMaterial({ color: 0x000000 });

export const createArrowMesh = () => {
	const markerMesh = new Mesh(ARROW_GEOMETRY, DEFAULT_MATERIAL);
	markerMesh.scale.set(10, 10, 10);

	return markerMesh;
};

const SQUARE_GEOMETRY = (() => {
	const vertices = new Float32Array([1, 0, 1, -1, 0, 1, -1, 0, -1, 1, 0, -1]);

	const indices = [0, 2, 1, 0, 3, 2];
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setIndex(indices);

	return geometry;
})();

export const createSquareMesh = () => {
	const markerMesh = new Mesh(SQUARE_GEOMETRY, DEFAULT_MATERIAL);
	markerMesh.scale.set(20, 20, 20);

	return markerMesh;
};

export const createCircleMesh = () => {
	const markerMesh = new Mesh(new CircleGeometry(20, 32), DEFAULT_MATERIAL);
	markerMesh.rotation.x = -Math.PI / 2;

	return markerMesh;
};

let DEFAULT_SUBWAY_GROUP: Group | null = null;
let DEFAULT_CAR_GROUP: Group | null = null;
let DEFAULT_TAXI_GROUP: Group | null = null;

export const createSubwayGroup = () => {
	return DEFAULT_SUBWAY_GROUP?.clone();
};

export const createTaxiGroup = () => {
	return DEFAULT_TAXI_GROUP?.clone();
};

export const createCarGroup = () => {
	return DEFAULT_CAR_GROUP?.clone();
};

const generateSVGGroup = (data: SVGResult) => {
	const group = new Group();

	const paths = data.paths;
	const material = new MeshBasicMaterial({
		color: new Color(0x000000),
		side: DoubleSide,
		depthWrite: false,
	});

	for (const path of paths) {
		const shapes = SVGLoader.createShapes(path);
		for (const shape of shapes) {
			const geometry = new ShapeGeometry(shape);
			geometry.computeBoundingBox();
			geometry.translate(
				-(geometry.boundingBox as Box3).max.x * 0.5,
				-(geometry.boundingBox as Box3).max.y * 0.5,
				-(geometry.boundingBox as Box3).max.z * 0.5,
			);

			const mesh = new Mesh(geometry, material);
			mesh.rotateX(Math.PI / 2);
			group.add(mesh);
		}
	}

	group.scale.set(0.1, 0.1, 0.1);
	return group;
};

const prepareSVGs = async () => {
	const loader = new SVGLoader();
	loader.load("/subway.svg", (data) => {
		DEFAULT_SUBWAY_GROUP = generateSVGGroup(data);
	});

	loader.load("/car.svg", (data) => {
		DEFAULT_CAR_GROUP = generateSVGGroup(data);
	});

	loader.load("/taxi.svg", (data) => {
		DEFAULT_TAXI_GROUP = generateSVGGroup(data);
	});
};

prepareSVGs();
