package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.dto.KarmaLogDto;
import com.ecoreturn.entity.KarmaLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface KarmaLogMapper extends BaseMapper<KarmaLog> {
    List<KarmaLogDto> findByUserIdWithRvmName(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
}
