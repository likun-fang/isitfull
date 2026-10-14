package com.ecoreturn.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RvmSyncResult {
    private final int fetched;
    private final int upserted;
    private final int newCount;
    private final int removedCount;
    private final List<String> newRvmNames;
    private final List<String> removedExternalIds;
}
