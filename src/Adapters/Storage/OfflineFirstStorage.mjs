export class OfflineFirstStorage {
  /**
   * @var {string}
   */
  #name;
  /**
   * @var {string|null}
   */
  #onlineApiBaseUrl = null;

  constructor(name, onlineApiBaseUrl) {
    this.#name = name;
    this.#onlineApiBaseUrl = onlineApiBaseUrl;
  }

  /**
   * @param {string} name
   * @param {string} onlineApiBaseUrl
   * @return {Promise<OfflineFirstStorage>}
   */
  static async new(name, onlineApiBaseUrl) {
    return new OfflineFirstStorage(name, onlineApiBaseUrl);
  }

  /**
   * @param {string} address
   * @param {function(jsonObject: string)} replyTo
   */
  async get(address, replyTo) {
    const dataCacheName = this.#name;
    const src = this.#onlineApiBaseUrl + "/" + address;
    const cache = await caches.open(dataCacheName);
    const cache_response = await cache.match(address) ?? null;
    let cacheData = null;
    await (async () => {
      if (cache_response !== null) {
        const cacheResponseData = await cache_response.json();
        replyTo(cacheResponseData);
      }
    });
    if (window.navigator.onLine === true) {
      const response = await fetch(src);
      const clonedResponse = await response.clone();
      console.log(clonedResponse);
      const responseData = await clonedResponse.json();
      if (JSON.stringify(cacheData) !== JSON.stringify(responseData)) {
        await cache.put(address, response);
        await replyTo(responseData);
      }
    }
  }
}