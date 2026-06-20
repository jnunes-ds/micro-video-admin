import { WrapperDataInterceptor } from './wrapper_data.interceptor.service';
import {of, lastValueFrom} from "rxjs";

describe('Wrapper_dataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });

  it('should wrapper with data key', async () => {
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of({name: 'test'}),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({data: {name: 'test'}});
  });

  it('should not wrapper when meta key is present', async () => {
    const data = {data: {name: 'test'}, meta: {total: 1}};
    const obs$ = interceptor.intercept(data as any, {
      handle: () => of(data),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual(data);
  });
});
