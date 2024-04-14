/**
 * Existe algum parâmetro na requisição em conflito com o servidor.
 */
export class ConflictError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'ConflictError';
    }
  }