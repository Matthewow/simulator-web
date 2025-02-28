import {
	BufferAttribute,
	BufferGeometry,
	CircleGeometry,
	Mesh,
	MeshBasicMaterial,
} from "three";

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
