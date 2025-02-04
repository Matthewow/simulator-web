import { Clock } from "three";

class TimelineTimer {
	private clock: Clock;
	private lastTime: number;
	timeScale: number;
	private elapsedTime: number;

	constructor() {
		this.clock = new Clock();
		this.lastTime = 0;
		this.timeScale = 1;
		this.elapsedTime = 0;
	}

	getElapsedTime() {
		const currentTime = this.clock.getElapsedTime();
		const timeDiff = currentTime - this.lastTime;

		this.elapsedTime += timeDiff * this.timeScale;

		this.lastTime = currentTime;

		return this.elapsedTime;
	}
}

export default TimelineTimer;
