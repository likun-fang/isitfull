package com.ecoreturn.service;

import com.ecoreturn.dto.FavoriteMergeResult;
import com.ecoreturn.entity.Favorite;
import com.ecoreturn.mapper.FavoriteMapper;
import com.ecoreturn.mapper.RvmMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private static final int MAX_FAVORITES = 100;

    private final FavoriteMapper favoriteMapper;
    private final RvmMapper rvmMapper;

    /**
     * Get all favorite RVM IDs for a user.
     */
    public List<Long> getFavorites(Long userId) {
        return favoriteMapper.selectRvmIdsByUserId(userId);
    }

    /**
     * Add a single favorite (idempotent).
     */
    @Transactional
    public void addFavorite(Long userId, Long rvmId) {
        // Check if already favorited
        if (favoriteMapper.existsByUserIdAndRvmId(userId, rvmId)) {
            return;
        }

        // Check if RVM exists
        if (rvmMapper.selectById(rvmId) == null) {
            throw new IllegalArgumentException("RVM not found: " + rvmId);
        }

        // Check max favorites limit
        List<Long> existing = favoriteMapper.selectRvmIdsByUserId(userId);
        if (existing.size() >= MAX_FAVORITES) {
            throw new IllegalStateException("Maximum favorites limit reached (" + MAX_FAVORITES + ")");
        }

        favoriteMapper.insert(new Favorite(userId, rvmId));
        log.info("User {} added RVM {} to favorites", userId, rvmId);
    }

    /**
     * Remove a single favorite.
     */
    @Transactional
    public void removeFavorite(Long userId, Long rvmId) {
        int deleted = favoriteMapper.deleteByUserIdAndRvmId(userId, rvmId);
        if (deleted > 0) {
            log.info("User {} removed RVM {} from favorites", userId, rvmId);
        }
    }

    /**
     * Merge local favorites with server favorites (for login sync).
     * Returns union of both sets, no duplicates.
     */
    @Transactional
    public FavoriteMergeResult mergeFavorites(Long userId, List<Long> localFavorites) {
        if (localFavorites == null || localFavorites.isEmpty()) {
            List<Long> existing = favoriteMapper.selectRvmIdsByUserId(userId);
            return FavoriteMergeResult.builder()
                .added(0)
                .total(existing.size())
                .favorites(existing)
                .build();
        }

        // Get existing server favorites
        Set<Long> existingSet = new HashSet<>(favoriteMapper.selectRvmIdsByUserId(userId));
        int addedCount = 0;

        // Add new favorites from local
        for (Long rvmId : localFavorites) {
            if (existingSet.contains(rvmId)) {
                continue;
            }

            // Check max limit
            if (existingSet.size() >= MAX_FAVORITES) {
                log.warn("User {} reached max favorites during merge, skipping remaining", userId);
                break;
            }

            // Check if RVM exists
            if (rvmMapper.selectById(rvmId) == null) {
                log.warn("Skipping invalid RVM {} during merge for user {}", rvmId, userId);
                continue;
            }

            favoriteMapper.insert(new Favorite(userId, rvmId));
            existingSet.add(rvmId);
            addedCount++;
        }

        List<Long> allFavorites = new ArrayList<>(existingSet);
        log.info("Merged favorites for user {}: added {}, total {}", userId, addedCount, allFavorites.size());

        return FavoriteMergeResult.builder()
            .added(addedCount)
            .total(allFavorites.size())
            .favorites(allFavorites)
            .build();
    }
}
