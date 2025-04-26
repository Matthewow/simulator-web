import { BoxGeometry, Group, Mesh, MeshMatcapMaterial } from "three";

const windowMaterial = new MeshMatcapMaterial({
	color: 0x87ceeb,
	transparent: true,
	opacity: 0.7,
}); // Light blue for windows
const wheelMaterial = new MeshMatcapMaterial({ color: 0x333333 }); // Dark gray for wheels
const lightMaterial = new MeshMatcapMaterial({ color: 0xff4500 }); // Orange/Red for lights
const signMaterial = new MeshMatcapMaterial({ color: 0xffffff }); // White for sign base

export const createTaxiGroup = () => {
	const taxiGroup = new Group(); // Group to hold all parts of the taxi

	const bodyMaterial = new MeshMatcapMaterial({ color: 0xffd700 }); // Yellow for body

	// --- Geometries (Dimensions remain same, positions adjusted for -Z orientation) ---

	// Main Body (Lower part)
	// BoxGeometry(width, height, depth) -> width is along X, depth is along Z
	const lowerBodyGeo = new BoxGeometry(2, 1, 4); // width, height, depth (taxi length along Z)
	const lowerBody = new Mesh(lowerBodyGeo, bodyMaterial);
	lowerBody.position.y = 0.5; // Position it slightly above the ground
	taxiGroup.add(lowerBody);

	// Cabin (Upper part)
	const cabinGeo = new BoxGeometry(1.8, 1, 2.5); // width, height, depth
	const cabin = new Mesh(cabinGeo, bodyMaterial);
	cabin.position.y = 1.5; // Position it on top of the lower body
	cabin.position.z = 0.25; // Slightly towards the *new* back (positive Z)
	taxiGroup.add(cabin);

	// --- Windows (represented by slightly inset darker boxes) ---
	// Front Window (Faces negative Z - the new front)
	const frontWindowGeo = new BoxGeometry(1.6, 0.8, 0.1); // width, height, depth
	const frontWindow = new Mesh(frontWindowGeo, windowMaterial);
	// Position at the new front of the cabin (cabin front edge is at z = 0.25 - 2.5/2 = -1.0)
	frontWindow.position.set(0, 1.5, -1.0);
	taxiGroup.add(frontWindow);

	// Back Window (Faces positive Z - the new back)
	const backWindowGeo = new BoxGeometry(1.6, 0.8, 0.1); // width, height, depth
	const backWindow = new Mesh(backWindowGeo, windowMaterial);
	// Position at the new back of the cabin (cabin back edge is at z = 0.25 + 2.5/2 = 1.5)
	backWindow.position.set(0, 1.5, 1.5);
	taxiGroup.add(backWindow);

	// Side Windows (Left & Right - along X axis)
	const sideWindowGeo = new BoxGeometry(0.1, 0.8, 2.3); // width, height, depth
	const leftWindow = new Mesh(sideWindowGeo, windowMaterial);
	// Position on the left side (positive X), centered along the shifted cabin's Z position
	leftWindow.position.set(0.95, 1.5, 0.25); // Centered at z = 0.25
	taxiGroup.add(leftWindow);

	const rightWindow = new Mesh(sideWindowGeo, windowMaterial);
	// Position on the right side (negative X), centered along the shifted cabin's Z position
	rightWindow.position.set(-0.95, 1.5, 0.25); // Centered at z = 0.25
	taxiGroup.add(rightWindow);

	// --- Wheels (Simple Cylinders or Boxes) ---
	// Using BoxGeometry for minimum vertices
	const wheelGeo = new BoxGeometry(0.3, 0.8, 0.8); // width(X), height(Y), depth(Z)

	// Adjusted positions (Z coordinates flipped relative to the previous version)
	const wheelPositions = [
		{ x: 1, y: 0.4, z: -1.5 }, // Front right (+X, -Z) - New Front
		{ x: -1, y: 0.4, z: -1.5 }, // Front left (-X, -Z) - New Front
		{ x: 1, y: 0.4, z: 1.5 }, // Back right (+X, +Z) - New Back
		{ x: -1, y: 0.4, z: 1.5 }, // Back left (-X, +Z) - New Back
	];

	for (const postion of wheelPositions) {
		const wheel = new Mesh(wheelGeo, wheelMaterial);
		wheel.position.set(postion.x, postion.y, postion.z);
		taxiGroup.add(wheel);
	}

	// --- Roof Sign ---
	const signBaseGeo = new BoxGeometry(0.5, 0.3, 1.5); // width(X), height(Y), depth(Z)
	const signBase = new Mesh(signBaseGeo, signMaterial);
	signBase.position.y = 2.15; // Position on top of the cabin
	signBase.position.z = 0.25; // Centered along the shifted cabin's Z position
	taxiGroup.add(signBase);

	// --- Lights (Small boxes) ---
	// Headlights (Front - negative Z)
	const headlightGeo = new BoxGeometry(0.2, 0.2, 0.2);
	const headlightL = new Mesh(headlightGeo, lightMaterial);
	// Position: Positive X (left side), front of lower body (negative Z)
	headlightL.position.set(0.7, 0.6, -2.05); // Positioned at the new front (-Z)
	taxiGroup.add(headlightL);
	const headlightR = new Mesh(headlightGeo, lightMaterial);
	// Position: Negative X (right side), front of lower body (negative Z)
	headlightR.position.set(-0.7, 0.6, -2.05); // Positioned at the new front (-Z)
	taxiGroup.add(headlightR);

	// Taillights (Back - positive Z)
	const taillightGeo = new BoxGeometry(0.2, 0.2, 0.2);
	const taillightL = new Mesh(taillightGeo, lightMaterial);
	// Position: Positive X (left side), back of lower body (positive Z)
	taillightL.position.set(0.7, 0.6, 2.05); // Positioned at the new back (+Z)
	taxiGroup.add(taillightL);
	const taillightR = new Mesh(taillightGeo, lightMaterial);
	// Position: Negative X (right side), back of lower body (positive Z)
	taillightR.position.set(-0.7, 0.6, 2.05); // Positioned at the new back (+Z)
	taxiGroup.add(taillightR);

	taxiGroup.scale.set(8, 8, 8);

	return taxiGroup;
};
