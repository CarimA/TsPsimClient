export class QueuedMessage {
	public message : string
	public promiseResolve : (any)
	
	constructor(message : string, promiseResolve : (any)) {
		this.message = message
		this.promiseResolve = promiseResolve
	}
}

