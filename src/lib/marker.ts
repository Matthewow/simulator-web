import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
} from "three";

const DEFAULT_GEOMETRY = (() => {
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

export const createMarkerMesh = () => {
	const markerMesh = new Mesh(DEFAULT_GEOMETRY, DEFAULT_MATERIAL);
	markerMesh.scale.set(10, 10, 10);

	return markerMesh;
};
