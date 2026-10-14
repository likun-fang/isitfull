package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.dto.RvmStatusSnapshot;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.enums.QueueLength;
import com.ecoreturn.enums.RvmStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RvmMapper extends BaseMapper<Rvm> {

    List<Rvm> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") int radiusMeters,
            @Param("limit") int limit
    );

    void updateStatus(
            @Param("id") Long id,
            @Param("status") RvmStatus status,
            @Param("confidenceScore") BigDecimal confidenceScore,
            @Param("queueLength") QueueLength queueLength,
            @Param("statusUpdatedAt") LocalDateTime statusUpdatedAt
    );

    List<Long> findAllIds();

    List<Long> findUnlockedIds();

    void updateAdminStatus(
            @Param("id") Long id,
            @Param("status") RvmStatus status,
            @Param("adminLocked") boolean adminLocked
    );

    long countByStatusIn(@Param("statuses") List<String> statuses);

    @Select("SELECT * FROM rvm ORDER BY created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<Rvm> listRvms(@Param("limit") int limit, @Param("offset") int offset);

    @Select("SELECT * FROM rvm WHERE city ILIKE CONCAT('%', #{city}, '%') " +
            "ORDER BY created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<Rvm> listRvmsByCity(@Param("city") String city, @Param("limit") int limit, @Param("offset") int offset);

    @Select("SELECT COUNT(*) FROM rvm WHERE city ILIKE CONCAT('%', #{city}, '%')")
    int countRvmsByCity(@Param("city") String city);

    @Select("SELECT external_id FROM rvm WHERE external_id IS NOT NULL")
    List<String> findAllExternalIds();

    List<RvmStatusSnapshot> findUnlockedStatuses();

    void batchUpdateStatus(@Param("updates") List<RvmStatusSnapshot> updates);
}
