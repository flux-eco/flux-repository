import {created, dataChanged} from './Behaviors.mjs';

export default class Actor {
    /**
     * @var {string}
     */
    #name;
    /**
     * @function()
     */
    #publish;

    /**
     * @var {{get: function( address: string, replyTo: function}}
     */
    #storage

    /**
     * @private
     */
    constructor(publish, storage) {
        this.#publish = publish;
        this.#storage = storage;
    }

    /**
     * @return {Actor}
     */
    static async new(name, publish, repository) {
        const obj = new Actor(publish, repository);
        await obj.#applyCreated(
            created(name)
        );
        return obj;
    }

    /**
     * @param {CreatedEvent} payload
     * @return {Promise<void>}
     */
    async #applyCreated(payload) {
        this.#name = payload.name;
        this.#publish(this.#name + "/" + created.name, payload);
    }

    /**
     * @param {FetchData} payload
     */
    async fetchData(payload) {
        this.#storage.get(
            payload.dataAddress,
            (json) => {
                this.#applyDataChanged(dataChanged(payload.next.address, {
                    ...payload.next.payload,
                    ...json
                }))
            }
        )
    }

    /**
     * @param {DataChangedEvent} payload
     */
    async #applyDataChanged(payload) {
        this.#publish(payload.publishTo, payload.payload);
    }
}