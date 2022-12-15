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
  /** @var {string} */
  #projectionApiBaseUrl;
  /** @var {string} */
  #projectCurrentUserAddress;

  /**
   * @private
   */
  constructor(applicationName) {
    this.#applicationName = applicationName;
    this.#actorName = applicationName + "/" + "repository";
  }

  /**
   * @param {FluxLayoutConfig} config
   * @return {FluxRepositoryApi}
   */
  static async initializeOfflineFirstRepository(config) {
    const obj = new FluxRepositoryApi(config.applicationName);
    obj.#messageStream = await MessageStream.new(obj.#actorName, config.logEnabled, obj.#actorColor);
    await obj.#initDefinitions(config.definitionsBaseUrl);
    obj.#projectionApiBaseUrl = config.projectionApiBaseUrl;
    await obj.#initOperations();
    obj.#projectCurrentUserAddress = config.projectCurrentUserAddress;
    return obj;
  }



  /**
   * @param {string} definitionBaseUrl
   * @return {Promise<void>}
   */
  async #initDefinitions(definitionBaseUrl) {
    this.#definitions = await Definitions.new(definitionBaseUrl)
  }

  /**
   * @return {void}
   */
  async initActor() {
    const storage = await OfflineFirstStorage.new(this.#actorName, this.#projectionApiBaseUrl)
    this.#actor = await Actor.new(this.#actorName, this.#projectCurrentUserAddress, (publishTo, payload) => {
        this.#publish(
            publishTo,
            payload
        )
      },
      storage
    );
  }

  async #initOperations() {
    const apiDefinition = await this.#definitions.apiDefinition();
    Object.entries(apiDefinition.tasks).forEach(([taskName, task]) => {
      const addressDefinition = task.address
      const address = addressDefinition.replace('{$applicationName}', this.#applicationName);
      this.#messageStream.register(address, (value) => this.#handle(task.onResult, value))
    });
  }

  async #handle(command, value) {
    if(value === null) {
      return;
    }
    try {
      this.#actor[command](value);
    }
    catch (e) {
      console.error(command + " " + e)
    }
  }

  /**
   * @param {string} publishTo
   * @param {object} resultValue
   * @return {Promise<void>}
   */
  async #publish(
      publishTo, resultValue
  ) {
    if(publishTo.includes('{$applicationName}')) {
      publishTo.replace('{$applicationName}', this.#applicationName);
    }
    this.#messageStream.publish(publishTo, resultValue)
  }
}