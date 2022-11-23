/**
 * @typedef {{dataAddress: string, addressParameter: object, next: {address: string, payload: { }}}} FetchData
 * @typedef {{name: string}} CreatedEvent
 * @typedef {{publishTo: string, payload: {}} } DataChangedEvent
 */

class Event {
    constructor(event) {
        this.event = event;
    }
}

/**
 * @param {string} name
 * @return {CreatedEvent}
 */
export const created = function (name) {
    return new Event({name: name}).event
}

/**
 * @return {DataChangedEvent}
 */
export const dataChanged = function (publishTo, payload) {
    return new Event({publishTo: publishTo, payload: payload}).event
}