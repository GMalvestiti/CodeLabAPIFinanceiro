import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let logger: Logger;
  let req: Partial<Request>;
  let res: Partial<Response> & { send: jest.Mock; getHeader: jest.Mock };
  let next: NextFunction;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    logger = new Logger(LoggerMiddleware.name);
    req = {
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET',
      headers: {},
      body: {},
      params: {},
      query: {},
    };
    res = {
      send: jest.fn(),
      getHeader: jest.fn(),
    } as Partial<Response> & { send: jest.Mock; getHeader: jest.Mock };
    next = jest.fn();
    jest.spyOn(logger, 'log').mockImplementation(() => {});
  });

  it('should log request information', () => {
    res.getHeader.mockReturnValue('text/plain');
    const exitData = 'success';

    middleware.use(req as Request, res as Response, next);
    res.send(exitData);

    expect(res.send).toHaveBeenCalledWith(exitData);
    expect(logger.log).not.toHaveBeenCalledWith(exitData);
  });

  it('should call next middleware', () => {
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
