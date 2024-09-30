import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { ResponseExceptionsFilter } from './response-exception.filter';

describe('ResponseExceptionsFilter', () => {
  let filter: ResponseExceptionsFilter<any>;
  let mockResponse: Response;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ResponseExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should catch HttpException and return the status and message', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not Found',
      data: null,
    });
  });

  it('should catch non-HttpException and return Internal Server Error status', () => {
    const exception = new Error('Some error occurred');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Some error occurred',
      data: null,
    });
  });

  it('should transform the response message correctly', () => {
    const exception = {
      response: {
        message: 'Custom error message',
      },
      message: 'Fallback error message',
    };

    const result = filter.transformResponse(exception as any);
    expect(result).toBe('Custom error message');
  });

  it('should return the default message if response message is not present', () => {
    const exception = {
      message: 'Fallback error message',
    };

    const result = filter.transformResponse(exception as any);
    expect(result).toBe('Fallback error message');
  });
});
