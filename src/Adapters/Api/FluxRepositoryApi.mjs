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
   * @param {Config} config
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
    Object.entries(apiDefinition.operations).forEach(([operationId, operation]) => {
      const onAddress = operation.on.address
      const address = onAddress.replace('{$applicationName}', this.#applicationName);
      this.#messageStream.register(address, (payload) => this.#handle(operation.handles, payload))
    });
  }

  async #handle(command, payload) {
    if(payload === null) {
      return;
    }
    try {
      this.#actor[command](payload);
    }
    catch (e) {
      console.error(command + " " + e)
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