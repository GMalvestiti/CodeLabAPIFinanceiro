import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisCacheService {
    constructor(@Inject('CACHE_MANAGER') private readonly cache: Cache) {}

    async get<T>(key: string): Promise<T | undefined> {
        return this.cache.get<T>(key);
    }

    async set<T>(key: string, value: T): Promise<void> {
        this.cache.set<T>(key, value);
    }

    async setWithoutTTL<T>(key: string, value: T): Promise<void> {
        this.cache.set<T>(key, value, { ttl: 0 });
    }

    async del(key: string): Promise<void> {
        this.cache.del(key);
    }

    async reset(): Promise<void> {
        this.cache.reset();
    }
}