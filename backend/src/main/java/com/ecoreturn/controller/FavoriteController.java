package com.ecoreturn.controller;

import com.ecoreturn.annotation.RequireAuth;
import com.ecoreturn.config.UserContext;
import com.ecoreturn.dto.ApiResponse;
import com.ecoreturn.dto.BatchFavoriteRequest;
import com.ecoreturn.dto.FavoriteMergeResult;
import com.ecoreturn.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Get all favorites for the current user.
     */
    @GetMapping
    @RequireAuth
    public ApiResponse<List<Long>> getFavorites() {
        Long userId = UserContext.getCurrentUserId();
        List<Long> favorites = favoriteService.getFavorites(userId);
        return ApiResponse.success(favorites);
    }

    /**
     * Add a single RVM to favorites.
     */
    @PostMapping("/{rvmId}")
    @RequireAuth
    public ApiResponse<Void> addFavorite(@PathVariable Long rvmId) {
        Long userId = UserContext.getCurrentUserId();
        favoriteService.addFavorite(userId, rvmId);
        return ApiResponse.success(null);
    }

    /**
     * Remove a single RVM from favorites.
     */
    @DeleteMapping("/{rvmId}")
    @RequireAuth
    public ApiResponse<Void> removeFavorite(@PathVariable Long rvmId) {
        Long userId = UserContext.getCurrentUserId();
        favoriteService.removeFavorite(userId, rvmId);
        return ApiResponse.success(null);
    }

    /**
     * Batch merge favorites (for login sync).
     * Merges local favorites with server favorites, returns union.
     */
    @PostMapping("/batch")
    @RequireAuth
    public ApiResponse<FavoriteMergeResult> mergeFavorites(@Valid @RequestBody BatchFavoriteRequest request) {
        Long userId = UserContext.getCurrentUserId();
        FavoriteMergeResult result = favoriteService.mergeFavorites(userId, request.getRvmIds());
        return ApiResponse.success(result);
    }
}
