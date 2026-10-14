package com.ecoreturn.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String error;
    private String message;
    private Meta meta;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Meta {
        private Integer total;
        private Integer radius;
        private Integer page;
        private Integer size;
        private Integer totalPages;

        public Meta() {
        }

        public Meta(Integer total, Integer radius) {
            this.total = total;
            this.radius = radius;
        }

        public Meta(int total, int page, int size) {
            this.total = total;
            this.page = page;
            this.size = size;
            this.totalPages = (total + size - 1) / size;
        }
    }

    private ApiResponse() {
    }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> success(T data, Meta meta) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        response.meta = meta;
        return response;
    }

    public static <T> ApiResponse<T> error(String error, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.error = error;
        response.message = message;
        return response;
    }
}
