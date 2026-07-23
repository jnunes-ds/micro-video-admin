import { Chance } from 'chance';
import { CastMemberType } from "@core/cast_member/domain/cast-member-type.vo";
import { CastMember, CastMemberId } from "@core/cast_member/domain/cast_member.aggregate";

type PropOrFactory<T> = T | ((index: number) => T);

export class CastMemberFakeBuilder<TBuild = any> {
  private _cast_member_id: PropOrFactory<CastMemberId> | undefined = undefined;
  private _name: PropOrFactory<string> = (_index) => this.chance.word();
  private _type: PropOrFactory<CastMemberType> = (_index) => CastMemberType.createAnActor();
  private _created_at: PropOrFactory<Date> | undefined = undefined;
  private countObjs: number;

  static aDirector() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.createADirector()
    );
  }

  static anActor() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.createAnActor()
    );
  }

  static theActors(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs).withType(
      CastMemberType.createAnActor()
    );
  }

  static theDirectors(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs).withType(
      CastMemberType.createADirector()
    );
  }

  static theCastMembers(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._cast_member_id = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withType(valueOrFactory: PropOrFactory<CastMemberType>) {
    this._type = valueOrFactory;
    return this;
  }

  withInvalidNameEmpty(value: "" | null | undefined) {
    this._name = value as any;
    return this;
  }

  withInvalidNameNotAString(value?: any) {
    this._name = value ?? 5;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withInvalidType() {
    this._type = "fake type" as any;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const castMembers = new Array(this.countObjs).fill(undefined).map(
      (_, index) =>
        new CastMember({
          cast_member_id: !this._cast_member_id
            ? undefined
            : this.callFactory(this._cast_member_id, index),
          name: this.callFactory(this._name, index),
          type: this.callFactory(this._type, index),
          ...(this._created_at && {
            created_at: this.callFactory(this._created_at, index),
          }),
        })
    );
    return (this.countObjs === 1 ? castMembers[0] : castMembers) as TBuild;
  }

  get cast_member_id(): CastMemberId {
    return this.getValue("cast_member_id");
  }

  get name(): string {
    return this.getValue("name");
  }

  get type(): CastMemberType {
    return this.getValue("type");
  }

  get created_at(): Date {
    return this.getValue("created_at");
  }

  private getValue(prop: string) {
    const optional = ["cast_member_id", "created_at"];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`
      );
    }
    return this.callFactory(this[privateProp] as any, 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === "function"
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}
