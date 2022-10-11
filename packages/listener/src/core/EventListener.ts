import { EventEmitter } from "events";
import { BlockPolling, BlockPollingEvent } from "./BlockPolling";
import { ContractEvent } from "./ContractEvent";

export class EventListener {
	private readonly polling: BlockPolling;

	private readonly emitter: EventEmitter = new EventEmitter();

	private readonly queue: ContractEvent[] = [];

	private _isRunning: boolean = false;

	private _isProcessing: boolean = false;

	constructor(polling: BlockPolling) {
		this.polling = polling;

		this.polling.on(BlockPollingEvent.Block, (events: ContractEvent[]) => {
			this.queue.push(...events);
			this._next();
		});

		this.polling.on(
			BlockPollingEvent.Error,
			(err) => this._isRunning && this.emitter.emit("error", err)
		);
	}

	start(startBlock: number) {
		this._isRunning = true;
		this.polling.start(startBlock);
	}

	stop() {
		this._isRunning = false;
		this.polling.stop();
	}

	public onContractEvent(
		callback: (event: ContractEvent, done: () => void) => void
	) {
		this.emitter.on("contractEvent", callback);
	}

	private _next() {
		if (this._isRunning && this.queue.length > 0 && !this._isProcessing) {
			const event = this.queue[0];

			const doneCallback = (err: Error | null = null) => {
				if (err == null) {
					this.queue.shift();
				}

				this._isProcessing = false;
				this._next();
			};

			this._isProcessing = true;
			if (!this.emitter.emit("contractEvent", event, doneCallback)) {
				doneCallback();
			}
		}
	}
}
