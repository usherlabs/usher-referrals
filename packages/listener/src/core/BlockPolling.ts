import { ethers } from "ethers";
import EventEmitter from "events";
import config from "../config";
import { BlockNotFoundError } from "../errors/BlockNotFoundError";
import { Options } from "../utils/Options";
import { ContractEvent } from "./ContractEvent";
import { EventFetcher } from "./EventFetcher";

export enum BlockPollingEvent {
	Block = "Block",
	Error = "Error"
}

export class BlockPolling {
	private _provider: ethers.providers.BaseProvider;

	private _eventFetcher: EventFetcher;

	private _emitter: EventEmitter;

	private _running: boolean;

	private _chunkSize: number;

	private _pollInterval: number;

	private _confirmations: number;

	private _backoff: number;

	private _latestQueriedBlock: number = 0;

	constructor(
		provider: ethers.providers.BaseProvider,
		eventFetcher: EventFetcher,
		options: Options = {}
	) {
		this._provider = provider;
		this._eventFetcher = eventFetcher;
		this._emitter = new EventEmitter();
		this._running = false;
		this._chunkSize = options.chunkSize || config.chunkSize;
		this._pollInterval = options.pollInterval || config.pollInterval;
		this._confirmations = options.confirmations || config.confirmations;
		this._backoff = options.backoff || config.backoff;
	}

	start(startBlock: number) {
		this._running = true;
		this._poll(startBlock);
	}

	stop() {
		this._running = false;
	}

	on(event: BlockPollingEvent, callback: (...args: any[]) => void) {
		this._emitter.on(event, callback);
	}

	private async _poll(fromBlock?: number) {
		try {
			const latestBlock =
				(await this._provider.getBlockNumber()) - this._confirmations;

			fromBlock = fromBlock || latestBlock;

			const toBlock = Math.min(fromBlock + this._chunkSize - 1, latestBlock);
			const latestdQueriedBlock = Math.min(toBlock, latestBlock);

			if (toBlock !== this._latestQueriedBlock) {
				const events = await this._eventFetcher.getEvents(fromBlock, toBlock);
				this._notify(events);
				this._latestQueriedBlock = toBlock;
			}

			const delay = toBlock === latestBlock ? this._pollInterval : 0;
			const nextBlock = Math.max(fromBlock, latestdQueriedBlock + 1);

			setTimeout(() => this._running && this._poll(nextBlock), delay);
		} catch (err) {
			if (!(err instanceof BlockNotFoundError)) {
				this._emitter.emit(BlockPollingEvent.Error, err);
			}

			setTimeout(() => this._running && this._poll(fromBlock), this._backoff);
		}
	}

	private _notify(events: ContractEvent[]) {
		this._emitter.emit(BlockPollingEvent.Block, events);
	}
}
