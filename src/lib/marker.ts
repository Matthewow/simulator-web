import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
} from "three";

const DEFAULT_MARKER_MESH = (() => {
	const vertices = new Float32Array([
		0, 0, 0.75, 1.0, 0, 1.0, 0, 0, -1.0, -1.0, 0, 1.0,
	]);

	const indices = [0, 1, 2, 0, 2, 3];
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setIndex(indices);

	const material = new MeshBasicMaterial({ color: 0xaaaaaa });
	const markerTemplate = new Mesh(geometry, material);
	markerTemplate.scale.set(15, 15, 15);

	return markerTemplate;
})();

export const createMarkerMesh = () => DEFAULT_MARKER_MESH.clone();
