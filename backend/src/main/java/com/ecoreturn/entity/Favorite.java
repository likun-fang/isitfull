package com.ecoreturn.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("user_favorites")
public class Favorite {

    @TableId
    private Long userId;
    private Long rvmId;
    private LocalDateTime createdAt;

    public Favorite(Long userId, Long rvmId) {
        this.userId = userId;
        this.rvmId = rvmId;
        this.createdAt = LocalDateTime.now();
    }
}
