package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.Favorite;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {

    @Select("SELECT rvm_id FROM user_favorites WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<Long> selectRvmIdsByUserId(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) > 0 FROM user_favorites WHERE user_id = #{userId} AND rvm_id = #{rvmId}")
    boolean existsByUserIdAndRvmId(@Param("userId") Long userId, @Param("rvmId") Long rvmId);

    @Delete("DELETE FROM user_favorites WHERE user_id = #{userId} AND rvm_id = #{rvmId}")
    int deleteByUserIdAndRvmId(@Param("userId") Long userId, @Param("rvmId") Long rvmId);
}
