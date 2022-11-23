import './Config.mjs';
import Actor from '../../Core/Actor.mjs';
import { OfflineFirstStorage } from '../Storage/OfflineFirstStorage.mjs';
import Definitions from '../Definitions/Definitions.mjs';
import MessageStream from '../EventStream/MessageStream.mjs';

export default class FluxRepositoryApi {
  /** @var {string} */
  #applicationName;
  /** @var {string} */
  #actorName;
  /** @var {string} */
  #actorColor = '#4DB6AC'
  /** @var {Actor} */
  #actor;
  /** @var {MessageStream} */
  #messageStream;
  /** @var {Definitions} */
  #definitions;

  /**
   * @private
   */
  constructor(applicationName) {
    this.#applicationName = applicationName;
    this.#actorName = applicationName + "/" + "repository";
  }

  /**
   * @param {Config} config
   * @return {void}
   */
  static async initializeOfflineFirstRepository(config) {
    const obj = new FluxRepositoryApi(config.applicationName);
    obj.#messageStream = await MessageStream.new(obj.#actorName, config.logEnabled, obj.#actorColor);
    await obj.#initDefinitions(config.definitionsBaseUrl);
    await obj.#initReactors();
    await obj.#initActor(await OfflineFirstStorage.new(obj.#actorName, config.projectionApiBaseUrl))
  }

  /**
   * @param {string} definitionBaseUrl
   * @return {Promise<void>}
   */
  async #initDefinitions(definitionBaseUrl) {
    this.#definitions = await Definitions.new(definitionBaseUrl)
  }

  async #initActor(storage) {
    this.#actor = await Actor.new(this.#actorName, (publishTo, payload) => {
        this.#publish(
            publishTo,
            payload
        )
      },
      storage
    );
  }

  async #initReactors() {
    const apiDefinition = await this.#definitions.apiDefinition();
    Object.entries(apiDefinition.processes).forEach(([reactionId, reaction]) => {
      const onAddress = reaction.on
      const address = onAddress.replace('{$applicationName}', this.#applicationName);
      this.#messageStream.register(address, (payload) => this.#reaction(reaction.action, payload), reaction.payload)
    });
  }

  async #reaction(action, payload) {
    try {
      this.#actor[action](payload);
    }
    catch (e) {
      console.error(action + " " + e)
    }
  }

  /**
   * @param {string} publishTo
   * @param {object} payload
   * @return {Promise<void>}
   */
  async #publish(
      publishTo, payload
  ) {
    if(publishTo.includes('{$applicationName}')) {
      publishTo.replace('{$applicationName}', this.#applicationName);
    }
    this.#messageStream.publish(publishTo, payload)
  }
}