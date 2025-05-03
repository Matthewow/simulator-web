import { Group } from "three";

export default class ViewLayer {
	static #singleton: ViewLayer | null = null;

	taxis: Group;
	privateCars: Group;
	buses: Group;

	subway: Group;
	paths: Group;
    stations: Group;

	private constructor() {
		this.taxis = new Group();
		this.privateCars = new Group();
		this.buses = new Group();

		this.subway = new Group();
		this.paths = new Group();
        this.stations = new Group();
	}

	static get instance() {
		if (!ViewLayer.#singleton) {
			ViewLayer.#singleton = new ViewLayer();
		}
		return ViewLayer.#singleton;
	}
}
