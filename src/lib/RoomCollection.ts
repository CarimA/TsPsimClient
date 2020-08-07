import { Client, Room } from '../Index'

export class RoomCollection {
	private _client : Client
	private _rooms : {[key: string]: Room}

	constructor(client : Client) {
		this._rooms = {}
		this._client = client
	}
	
	public find(name : string) : Room {
		if (!this.get(name))
			this._rooms[name] = new Room(name, this._client)

		return this.get(name)
	}

	public remove(room : Room) : boolean {
		if (this._rooms[room.name]) {
			delete this._rooms[room.name]
			return true
		}

		return false
	}

	private get(name : string) : Room {
		return this._rooms[name]
	}

}