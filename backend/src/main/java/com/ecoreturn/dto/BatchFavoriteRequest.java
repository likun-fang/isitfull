package com.ecoreturn.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchFavoriteRequest {

    @NotEmpty(message = "RVM IDs list cannot be empty")
    @Size(max = 100, message = "Cannot add more than 100 favorites at once")
    private List<Long> rvmIds;
}
