import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('should transform response correctly', (done) => {
    const mockData = { message: 'Success', data: { id: 1 }, count: 1 };
    const executionContext = {} as ExecutionContext;
    const callHandler: CallHandler<any> = {
      handle: () => of(mockData),
    };

    const result = interceptor.intercept(executionContext, callHandler);

    if (result instanceof Observable) {
      result.subscribe((output) => {
        expect(output).toEqual({
          message: 'Success',
          data: { id: 1 },
          count: 1,
        });
        done();
      });
    }
  });

  it('should handle response without message and count', (done) => {
    const mockData = { data: { id: 2 } };
    const executionContext = {} as ExecutionContext;
    const callHandler: CallHandler<any> = {
      handle: () => of(mockData),
    };

    const result = interceptor.intercept(executionContext, callHandler);

    if (result instanceof Observable) {
      result.subscribe((output) => {
        expect(output).toEqual({
          message: null,
          data: { id: 2 },
          count: undefined,
        });
        done();
      });
    }
  });

  it('should handle response with only count', (done) => {
    const mockData = { count: 10 };
    const executionContext = {} as ExecutionContext;
    const callHandler: CallHandler<any> = {
      handle: () => of(mockData),
    };

    const result = interceptor.intercept(executionContext, callHandler);

    if (result instanceof Observable) {
      result.subscribe((output) => {
        expect(output).toEqual({
          message: null,
          data: mockData,
          count: 10,
        });
        done();
      });
    }
  });
});
