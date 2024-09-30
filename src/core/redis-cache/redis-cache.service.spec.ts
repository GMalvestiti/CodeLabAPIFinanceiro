import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    cacheManager = module.get<Cache>('CACHE_MANAGER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a value from the cache', async () => {
    const key = 'testKey';
    const value = 'testValue';
    jest.spyOn(cacheManager, 'get').mockResolvedValue(value);

    const result = await service.get<string>(key);
    expect(result).toBe(value);
    expect(cacheManager.get).toHaveBeenCalledWith(key);
  });

  it('should set a value in the cache', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await service.set<string>(key, value);
    expect(cacheManager.set).toHaveBeenCalledWith(key, value);
  });

  it('should set a value in the cache without TTL', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await service.setWithoutTTL<string>(key, value);
    expect(cacheManager.set).toHaveBeenCalledWith(key, value, { ttl: 0 });
  });

  it('should delete a value from the cache', async () => {
    const key = 'testKey';

    await service.del(key);
    expect(cacheManager.del).toHaveBeenCalledWith(key);
  });

  it('should reset the cache', async () => {
    await service.reset();
    expect(cacheManager.reset).toHaveBeenCalled();
  });
});
