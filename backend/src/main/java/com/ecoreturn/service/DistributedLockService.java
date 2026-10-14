package com.ecoreturn.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class DistributedLockService {

    private final StringRedisTemplate redisTemplate;

    /**
     * Try to acquire a distributed lock.
     *
     * @param lockKey the key to use for the lock
     * @param ttl     how long the lock should be held (prevents deadlocks)
     * @return true if lock was acquired, false otherwise
     */
    public boolean tryLock(String lockKey, Duration ttl) {
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "locked", ttl);
        return Boolean.TRUE.equals(acquired);
    }

    /**
     * Release a distributed lock.
     *
     * @param lockKey the key of the lock to release
     */
    public void unlock(String lockKey) {
        redisTemplate.delete(lockKey);
    }
}
