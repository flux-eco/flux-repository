export default class MessageStream {

  /**  @var {string} */
  #actorName;
  /** @var {boolean} */
  #logEnabled;
  /**  @var {string} */
  #stylePublish;
  /**  @var {string} */
  #styleRegister;

  /** @var private */
  constructor(actorName, logEnabled, color) {
    this.#actorName = actorName;
    this.#logEnabled = logEnabled;

    const fontColor = ["color: " + color];
    this.#stylePublish = [...fontColor,"font-weight: bold", "font-size: 16px"].join(";")
    this.#styleRegister = [...fontColor,"font-style: italic"].join(";")
  }

  static async new(actorName, logEnabled, color) {
    return new this(actorName, logEnabled, color);
  }

  /**
   * @param {string} publishTo
   * @param {object} payload
   */
  publish(publishTo, payload) {
    if (this.#logEnabled === true) {
      console.group()
      console.log('Actor');
      console.log('%c' + this.#actorName, this.#stylePublish);
      console.log('has published')
      console.log('%c' + JSON.stringify(payload), this.#stylePublish);
      console.log('to')
      console.log('%c' + publishTo, this.#stylePublish);
      console.groupEnd()
    }

    const channel = new BroadcastChannel(publishTo)
    channel.postMessage(payload)
  }

  /**
   * @param {string} on
   * @param {function} callbackAction
   */
  register(on, callbackAction) {
    const channel = new BroadcastChannel(on);
    channel.addEventListener('message', messageEvent => {
      callbackAction(messageEvent.data);
    })

    if (this.#logEnabled === true) {
      console.group()
      console.log('Actor');
      console.log('%c' + this.#actorName, this.#styleRegister);
      console.log('has registered a callbackFunction. He will react in future on messages send to:')
      console.log('%c' + on, this.#styleRegister);
      console.groupEnd()
    }
  }
}