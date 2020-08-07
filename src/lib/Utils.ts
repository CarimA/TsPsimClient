import { User } from './User'

export function toId(text : string) {
	return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isVoice(user : User) {
	return (user.rank === '+'
	|| isDriver(user))
}

export function isDriver(user : User) {
	return (user.rank === '%'
	|| isModerator(user))
}

export function isModerator(user : User) {
	return (user.rank === '@'
	|| isRoomOwner(user))
}

export function isRoomOwner(user : User) {
	return (user.rank === '#'
	|| isAdministrator(user))
}

export function isAdministrator(user : User) {
	return (user.rank === '&')
}