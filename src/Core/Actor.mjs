import { created, currentUserChanged, dataChanged } from './Behaviors.mjs';

export default class Actor {
  /**
   * @var {string}
   */
  #name;
  /**
   * @var {string}
   */
  #projectCurrentUserAddress;
  /**
   * @function()
   */
  #publish;

  /**
   * @var {{get: function( address: string, replyTo: function}}
   */
  #storage

  /**
   * @var {{id: string, email: string}}
   */
  #currentUser = { id: "", email: "" };

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
  static async new(name, projectCurrentUserAddress, publish, repository) {
    const obj = new Actor(publish, repository);
    await obj.#applyCreated(
      created(name, projectCurrentUserAddress)
    );
    return obj;
  }

  /**
   * @param {CreatedEvent} payload
   * @return {Promise<void>}
   */
  async #applyCreated(payload) {
    this.#name = payload.name;
    this.#projectCurrentUserAddress = payload.projectCurrentUserAddress;
    this.#publish(this.#name + "/" + created.name, payload);
  }

  /**
   * @param {FetchData} payload
   */
  async fetchData(payload) {
    await this.changeCurrentUser({
      address: this.#projectCurrentUserAddress
    });

    console.log(payload);

    let entityFilter = {}
    if(payload && payload.hasOwnProperty('data')) {
      entityFilter = payload.data;
    }

    const $usrIdParts = this.#currentUser.id.split('/');
    console.log( this.#currentUser);
    entityFilter[$usrIdParts[0]] = $usrIdParts[1];

    const address = await payload.dataAddress;
    this.#storage.get(
        address,
      entityFilter, //todo rename
      (json) => {
        this.#applyDataChanged(dataChanged(payload.next.address, {
          ...json,
          ...payload.next.payload,
        }))
      }
    )
  }

  /**
   * @param {ChangeCurrentUser} payload
   */
  async changeCurrentUser(payload) {
    await this.#storage.get(
      payload.address,
      {},
      (json) => {
        if (json.id !== this.#currentUser.id) {
          this.#applyCurrentUserChanged(
            currentUserChanged(json.id, json.email)
          )
        }
      }
    )
  }

  /**
   * @param {CurrentUserChangedEvent} payload
   */
  async #applyCurrentUserChanged(payload) {
    this.#currentUser = {
      id: payload.id,
      email: payload.email
    }
    this.#publish(this.#name + "/" + currentUserChanged.name, payload);
  }


  /**
   * @param {DataChangedEvent} payload
   */
  async #applyDataChanged(payload) {
    this.#publish(payload.publishTo, payload.payload);
  }
}