import { Client, Room } from '../Index'

export class RoomCollection {
	private _client : Client
	private _rooms : {[key: string]: Room}

	constructor(client : Client) {
		this._rooms = {}
		this._client = client
	}
	
	public find(name : string) : Room {
		let room = this.get(name)

		if (!room) {
			room = new Room(name, this._client)
			this._rooms[name] = room
		}
		
		return room
	}

	public remove(room : Room) : boolean {
		if (this._rooms[room.name]) {
			delete this._rooms[room.name]
			return true
		}

		return false
	}

	public get(name : string) : Room | undefined {
		return this._rooms[name]
	}

}