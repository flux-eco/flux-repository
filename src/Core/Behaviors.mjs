/**
 * @typedef {{dataAddress: string, addressParameter: object, next: {address: string, payload: { }}}} FetchData
 * @typedef {{address: string}} ChangeCurrentUser
 * @typedef {{id: string, email: string}} CurrentUserChangedEvent
 * @typedef {{name: string, projectCurrentUserAddress: string}} CreatedEvent
 * @typedef {{publishTo: string, payload: {}} } DataChangedEvent
 */

class Event {
    constructor(event) {
        this.event = event;
    }
}

/**
 * @param {string} name
 * @param {string} projectCurrentUserAddress
 * @return {CreatedEvent}
 */
export const created = function (name, projectCurrentUserAddress) {
    return new Event({name: name, projectCurrentUserAddress: projectCurrentUserAddress}).event
}

/**
 * @return {DataChangedEvent}
 */
export const dataChanged = function (publishTo, payload) {
    return new Event({publishTo: publishTo, payload: payload}).event
}

/**
 * @return {CurrentUserChangedEvent}
 */
export const currentUserChanged = function (id, email) {
    return new Event({id: id, email: email}).event
}