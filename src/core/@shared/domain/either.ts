/**
 * Either representa o resultado de uma operação que pode falhar sem lançar exceção:
 * ou existe um valor de sucesso (ok), ou existe um erro (fail) - nunca os dois.
 *
 * A classe é iterável, então pode ser desestruturada como uma tupla:
 *
 *   const [type, error] = CastMemberType.create(1).asArray();
 *   if (error) { ... }
 */
export class Either<Ok = unknown, ErrorResult = Error>
	implements Iterable<Ok | ErrorResult | null> {

	private constructor(
		private readonly _ok: Ok | null,
		private readonly _error: ErrorResult | null
	) {}

	static ok<O, E = Error>(value: O): Either<O, E> {
		return new Either<O, E>(value, null);
	}

	static fail<E, O = unknown>(error: E): Either<O, E> {
		return new Either<O, E>(null, error);
	}

	static of<O, E = Error>(value: O): Either<O, E> {
		return Either.ok<O, E>(value);
	}

	/**
	 * Executa uma função que lança exceção e converte o throw em Either.fail.
	 * É a ponte entre código que valida lançando erro (value objects) e o fluxo com Either.
	 */
	static safe<O, E = Error>(fn: () => O): Either<O, E> {
		try {
			return Either.ok<O, E>(fn());
		} catch (e) {
			return Either.fail<E, O>(e as E);
		}
	}

	get value(): Ok | null {
		return this._ok;
	}

	get error(): ErrorResult | null {
		return this._error;
	}

	isOk(): boolean {
		return this._error === null;
	}

	isFail(): boolean {
		return this._error !== null;
	}

	/**
	 * Transforma o valor de sucesso. Se for uma falha, o erro é propagado intacto.
	 */
	map<NewOk>(fn: (value: Ok) => NewOk): Either<NewOk, ErrorResult> {
		if (this.isFail()) {
			return Either.fail<ErrorResult, NewOk>(this._error as ErrorResult);
		}
		return Either.ok<NewOk, ErrorResult>(fn(this._ok as Ok));
	}

	/**
	 * Encadeia outra operação que também retorna Either (evita Either<Either<...>>).
	 */
	chain<NewOk, NewError = ErrorResult>(
		fn: (value: Ok) => Either<NewOk, NewError>
	): Either<NewOk, ErrorResult | NewError> {
		if (this.isFail()) {
			return Either.fail<ErrorResult, NewOk>(this._error as ErrorResult);
		}
		return fn(this._ok as Ok);
	}

	getOrThrow(): Ok {
		if (this.isFail()) {
			throw this._error;
		}
		return this._ok as Ok;
	}

	/**
	 * Tipagem posicional [valor, erro]. O narrowing fica com o consumidor (`if (error)`),
	 * o que mantém os call sites simples sob strictNullChecks.
	 */
	asArray(): [Ok, ErrorResult] {
		return [this._ok, this._error] as [Ok, ErrorResult];
	}

	*[Symbol.iterator](): Iterator<Ok | ErrorResult | null> {
		yield this._ok;
		yield this._error;
	}
}
