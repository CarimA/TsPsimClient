export function toId(text : string) : string {
	return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isVoice(rank : string) : boolean {
	return (rank.substr(0, 1) === '+'
	|| isDriver(rank))
}

export function isDriver(rank : string) : boolean {
	return (rank.substr(0, 1) === '%'
	|| isModerator(rank))
}

export function isModerator(rank : string) : boolean {
	return (rank.substr(0, 1) === '@'
	|| isRoomOwner(rank))
}

export function isRoomOwner(rank : string) : boolean {
	return (rank.substr(0, 1) === '#'
	|| isAdministrator(rank))
}

export function isAdministrator(rank : string) : boolean {
	return (rank.substr(0, 1) === '&')
}

export function sanitizeUsername(username : string) : string {
	return username.substr(1).trim().toLowerCase()
}

export function getRank(username : string) : string {
	return username.substr(0, 1)
}

export async function delay(milliseconds : number) : Promise<void> {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}