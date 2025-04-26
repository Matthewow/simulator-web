import {
	BoxGeometry,
	CylinderGeometry,
	Group,
	Mesh,
	MeshMatcapMaterial,
} from "three";

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

const bumperMaterial = new MeshMatcapMaterial({ color: 0x555555 }); // Dark gray for bumpers

export const createBusGroup = () => {
	const busGroup = new Group(); // Group to hold all parts of the bus

	// --- Materials ---
	const bodyMaterial = new MeshMatcapMaterial({ color: 0xdc143c }); // Crimson red for body

	// --- Geometries (Using BoxGeometry for low vertex count) ---

	// Main Bus Body
	// BoxGeometry(width, height, depth) -> width is along X, depth is along Z
	const bodyWidth = 2.5;
	const bodyHeight = 2.2;
	const bodyDepth = 8.0; // Bus is long along Z
	const bodyGeo = new BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
	const body = new Mesh(bodyGeo, bodyMaterial);
	body.position.y = bodyHeight / 2; // Position it so the bottom is at y=0
	// ADD BODY FIRST as requested
	busGroup.add(body);

	// --- Windows ---
	const windowHeight = 1.0;
	const windowInset = 0.05; // How much windows are inset from the body surface

	// Front Window (Faces negative Z - the front)
	const frontWindowGeo = new BoxGeometry(bodyWidth - 0.4, windowHeight, 0.1); // Slightly narrower than body
	const frontWindow = new Mesh(frontWindowGeo, windowMaterial);
	// Position at the front face of the body
	frontWindow.position.set(0, bodyHeight * 0.65, -bodyDepth / 2 - windowInset); // Y position higher up
	busGroup.add(frontWindow);

	// Back Window (Faces positive Z - the back)
	const backWindowGeo = new BoxGeometry(bodyWidth - 0.4, windowHeight, 0.1);
	const backWindow = new Mesh(backWindowGeo, windowMaterial);
	// Position at the back face of the body
	backWindow.position.set(0, bodyHeight * 0.65, bodyDepth / 2 + windowInset);
	busGroup.add(backWindow);

	// Side Windows (Multiple smaller windows along the sides)
	const sideWindowWidth = 0.1;
	const numSideWindows = 5;
	const sideWindowLength = (bodyDepth * 0.8) / numSideWindows; // Leave some space at front/back
	const sideWindowSpacing = sideWindowLength * 0.15; // Small gap between windows
	const sideWindowEffectiveLength = sideWindowLength - sideWindowSpacing;
	const sideWindowStartY = bodyHeight * 0.65; // Match front/back window height center
	const sideWindowStartZ =
		-bodyDepth / 2 + sideWindowLength / 2 + bodyDepth * 0.05; // Start near the front

	for (let i = 0; i < numSideWindows; i++) {
		const sideWindowGeo = new BoxGeometry(
			sideWindowWidth,
			windowHeight,
			sideWindowEffectiveLength,
		);

		// Left Side (Positive X)
		const leftWindow = new Mesh(sideWindowGeo, windowMaterial);
		leftWindow.position.set(
			bodyWidth / 2 + windowInset,
			sideWindowStartY,
			sideWindowStartZ + i * sideWindowLength,
		);
		busGroup.add(leftWindow);

		// Right Side (Negative X)
		const rightWindow = new Mesh(sideWindowGeo, windowMaterial);
		rightWindow.position.set(
			-bodyWidth / 2 - windowInset,
			sideWindowStartY,
			sideWindowStartZ + i * sideWindowLength,
		);
		busGroup.add(rightWindow);
	}

	// --- Wheels (Using CylinderGeometry for slightly better look, still low-poly) ---
	// *** MODIFIED: Made wheels smaller ***
	const wheelRadius = 0.4; // Reduced from 0.6
	const wheelThickness = 0.3; // Reduced from 0.4
	// Switched to Cylinder for a rounder look, Box can be used for fewer vertices
	const wheelGeo = new CylinderGeometry(
		wheelRadius,
		wheelRadius,
		wheelThickness,
		12,
	); // RadiusTop, RadiusBottom, Height, RadialSegments
	wheelGeo.rotateZ(Math.PI / 2); // Rotate cylinder to align with axle

	// *** MODIFIED: Adjusted wheel Y position based on new radius ***
	const wheelY = wheelRadius; // Position wheels so bottom touches y=0
	const wheelXOffset = bodyWidth / 2 - wheelThickness / 2 + 0.1; // Position wheels slightly outside the main body width
	const frontAxleZ = -bodyDepth / 2 + 1.0; // Position front axle near the front
	const rearAxleZ = bodyDepth / 2 - 1.5; // Position rear axle near the back

	const wheelPositions = [
		{ x: wheelXOffset, y: wheelY, z: frontAxleZ }, // Front right
		{ x: -wheelXOffset, y: wheelY, z: frontAxleZ }, // Front left
		{ x: wheelXOffset, y: wheelY, z: rearAxleZ }, // Rear right
		{ x: -wheelXOffset, y: wheelY, z: rearAxleZ }, // Rear left
	];

	for (const postion of wheelPositions) {
		const wheel = new Mesh(wheelGeo, wheelMaterial);
		wheel.position.set(postion.x, postion.y, postion.z);
		busGroup.add(wheel);
	}

	// --- Bumpers ---
	const bumperHeight = 0.3;
	const bumperDepth = 0.15;
	const bumperGeo = new BoxGeometry(bodyWidth + 0.1, bumperHeight, bumperDepth); // Slightly wider than body

	// Front Bumper
	const frontBumper = new Mesh(bumperGeo, bumperMaterial);
	frontBumper.position.set(
		0,
		bumperHeight / 2,
		-bodyDepth / 2 - bumperDepth / 2,
	);
	busGroup.add(frontBumper);

	// Rear Bumper
	const rearBumper = new Mesh(bumperGeo, bumperMaterial);
	rearBumper.position.set(0, bumperHeight / 2, bodyDepth / 2 + bumperDepth / 2);
	busGroup.add(rearBumper);

	// --- Lights (Small boxes) ---
	const lightSize = 0.2;
	const lightGeo = new BoxGeometry(lightSize, lightSize, lightSize);

	// Headlights (Front - negative Z)
	// *** MODIFIED: Adjusted light Y position slightly due to smaller wheels/lower bumpers ***
	const headlightY = bumperHeight + lightSize * 0.6; // Lowered slightly
	const headlightX = bodyWidth / 2 - 0.4;
	const headlightZ = -bodyDepth / 2 - lightSize / 2;

	const headlightL = new Mesh(lightGeo, lightMaterial);
	headlightL.position.set(headlightX, headlightY, headlightZ);
	busGroup.add(headlightL);
	const headlightR = new Mesh(lightGeo, lightMaterial);
	headlightR.position.set(-headlightX, headlightY, headlightZ);
	busGroup.add(headlightR);

	// Taillights (Back - positive Z) - Often red, using same material for simplicity
	// *** MODIFIED: Adjusted light Y position slightly due to smaller wheels/lower bumpers ***
	const taillightY = bumperHeight + lightSize * 0.6; // Lowered slightly
	const taillightX = bodyWidth / 2 - 0.4;
	const taillightZ = bodyDepth / 2 + lightSize / 2;

	const taillightL = new Mesh(lightGeo, lightMaterial);
	taillightL.position.set(taillightX, taillightY, taillightZ);
	busGroup.add(taillightL);
	const taillightR = new Mesh(lightGeo, lightMaterial);
	taillightR.position.set(-taillightX, taillightY, taillightZ);
	busGroup.add(taillightR);
	busGroup.scale.set(6, 6, 6);

	return busGroup;
};

const headlightMaterial = new MeshMatcapMaterial({ color: 0xffffff }); // White/Yellowish for headlights

export const createPrivateCatGroup = () => {
	const carGroup = new Group(); // Group to hold all parts of the car

	// --- Materials ---
	const bodyMaterial = new MeshMatcapMaterial({ color: 0x0077cc }); // Blue color for car body

	// --- Geometries (Using BoxGeometry for low vertex count) ---

	// Main Car Body (Lower part)
	// BoxGeometry(width, height, depth) -> width is along X, depth is along Z
	const bodyWidth = 2.0;
	const bodyHeight = 0.8;
	const bodyDepth = 4.5; // Length of the car along Z
	const lowerBodyGeo = new BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
	const lowerBody = new Mesh(lowerBodyGeo, bodyMaterial);
	lowerBody.position.y = bodyHeight / 2; // Position base at y=0
	// ADD BODY FIRST
	carGroup.add(lowerBody);

	// Cabin/Roof (Upper part) - Slightly shorter and narrower
	const cabinWidth = bodyWidth * 0.9;
	const cabinHeight = 0.7;
	const cabinDepth = bodyDepth * 0.6; // Cabin is shorter than the base
	const cabinGeo = new BoxGeometry(cabinWidth, cabinHeight, cabinDepth);
	const cabin = new Mesh(cabinGeo, bodyMaterial);
	// Position cabin on top of the lower body, slightly towards the center/rear
	cabin.position.y = bodyHeight + cabinHeight / 2;
	cabin.position.z = bodyDepth * 0.1; // Shift cabin slightly back (positive Z)
	carGroup.add(cabin);

	// --- Windows ---
	const windowHeight = cabinHeight * 0.7;
	const windowInset = 0.05; // How much windows are inset

	// Front Windshield (Faces negative Z - the front) - Slanted look approximation
	const windshieldDepth = 0.1;
	const windshieldGeo = new BoxGeometry(
		cabinWidth - 0.2,
		windowHeight,
		windshieldDepth,
	);
	const windshield = new Mesh(windshieldGeo, windowMaterial);
	// Position at the front of the cabin
	const cabinFrontZ = cabin.position.z - cabinDepth / 2;
	windshield.position.set(0, cabin.position.y, cabinFrontZ - windowInset);
	// Simple slant approximation by rotating slightly around X
	// windshield.rotation.x = -Math.PI / 12; // Optional: slight tilt
	carGroup.add(windshield);

	// Back Window (Faces positive Z - the back)
	const backWindowGeo = new BoxGeometry(
		cabinWidth - 0.2,
		windowHeight,
		windshieldDepth,
	);
	const backWindow = new Mesh(backWindowGeo, windowMaterial);
	// Position at the back of the cabin
	const cabinBackZ = cabin.position.z + cabinDepth / 2;
	backWindow.position.set(0, cabin.position.y, cabinBackZ + windowInset);
	// Simple slant approximation
	// backWindow.rotation.x = Math.PI / 16; // Optional: slight tilt
	carGroup.add(backWindow);

	// Side Windows (Left & Right)
	const sideWindowWidth = 0.1;
	const sideWindowLength = cabinDepth * 0.9; // Almost full length of cabin
	const sideWindowGeo = new BoxGeometry(
		sideWindowWidth,
		windowHeight,
		sideWindowLength,
	);

	// Left Side (Positive X)
	const leftWindow = new Mesh(sideWindowGeo, windowMaterial);
	leftWindow.position.set(
		cabinWidth / 2 + windowInset,
		cabin.position.y,
		cabin.position.z,
	);
	carGroup.add(leftWindow);

	// Right Side (Negative X)
	const rightWindow = new Mesh(sideWindowGeo, windowMaterial);
	rightWindow.position.set(
		-cabinWidth / 2 - windowInset,
		cabin.position.y,
		cabin.position.z,
	);
	carGroup.add(rightWindow);

	// --- Wheels (Using CylinderGeometry) ---
	const wheelRadius = 0.4;
	const wheelThickness = 0.25;
	const wheelGeo = new CylinderGeometry(
		wheelRadius,
		wheelRadius,
		wheelThickness,
		12,
	);
	wheelGeo.rotateZ(Math.PI / 2); // Align with axle

	// *** MODIFIED: Lowered the wheels slightly ***
	const wheelY = wheelRadius - 0.1; // Position bottom of wheel slightly below y=0
	const wheelXOffset = bodyWidth / 2 - wheelThickness / 2 + 0.05; // Position wheels slightly outside body
	const axleOffsetZ = bodyDepth * 0.35; // Distance of axles from center

	const wheelPositions = [
		{ x: wheelXOffset, y: wheelY, z: -axleOffsetZ }, // Front right (-Z direction)
		{ x: -wheelXOffset, y: wheelY, z: -axleOffsetZ }, // Front left (-Z direction)
		{ x: wheelXOffset, y: wheelY, z: axleOffsetZ }, // Rear right (+Z direction)
		{ x: -wheelXOffset, y: wheelY, z: axleOffsetZ }, // Rear left (+Z direction)
	];

	wheelPositions.forEach((pos) => {
		const wheel = new Mesh(wheelGeo, wheelMaterial);
		wheel.position.set(pos.x, pos.y, pos.z);
		carGroup.add(wheel);
	});

	// --- Lights ---
	const lightSize = 0.15;
	const lightGeo = new BoxGeometry(lightSize, lightSize * 0.8, lightSize);

	// Headlights (Front - negative Z)
	const headlightY = bodyHeight * 0.6;
	const headlightX = bodyWidth / 2 - 0.3;
	const headlightZ = -bodyDepth / 2 - lightSize / 2;

	const headlightL = new Mesh(lightGeo, headlightMaterial); // Use white material
	headlightL.position.set(headlightX, headlightY, headlightZ);
	carGroup.add(headlightL);
	const headlightR = new Mesh(lightGeo, headlightMaterial); // Use white material
	headlightR.position.set(-headlightX, headlightY, headlightZ);
	carGroup.add(headlightR);

	// Taillights (Back - positive Z)
	const taillightY = bodyHeight * 0.6;
	const taillightX = bodyWidth / 2 - 0.3;
	const taillightZ = bodyDepth / 2 + lightSize / 2;

	const taillightL = new Mesh(lightGeo, lightMaterial); // Use red/orange material
	taillightL.position.set(taillightX, taillightY, taillightZ);
	carGroup.add(taillightL);
	const taillightR = new Mesh(lightGeo, lightMaterial); // Use red/orange material
	taillightR.position.set(-taillightX, taillightY, taillightZ);
	carGroup.add(taillightR);
	carGroup.scale.set(8, 8, 8);

	return carGroup;
};
