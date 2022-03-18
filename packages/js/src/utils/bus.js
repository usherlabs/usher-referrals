import { initialize, emit as fEmit, on as fOn } from "framebus";

const bus = initialize({
	channel: "usher_sat"
});

const Bus = {
	emit: (...params) => fEmit(bus, ...params),
	on: (...params) => fOn(bus, ...params)
};

Object.freeze(Bus);

export default Bus;
