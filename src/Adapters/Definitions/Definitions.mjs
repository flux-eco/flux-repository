export default class Definitions {

  #definitionsPath;

  /**
   * @private
   */
  constructor(baseUrl) {
    this.#definitionsPath = baseUrl;
  }

  /**
   * @param baseUrl
   * @return {Promise<Definitions>}
   */
  static async new(baseUrl) {
    return new Definitions(baseUrl);
  }

  async apiDefinition() {
    return await this.#importJsonSchema(this.#definitionsPath + '/api/api.json');
  }

  async #importJsonSchema(src) {
    const response = await (await fetch(src, { assert: { type: 'json' } }));
    return await response.json();
  }

}