package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
    long countTotal();

    @Select("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND last_active_at >= #{cutoff}")
    long countActiveAfter(@Param("cutoff") LocalDateTime cutoff);

    @Select("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= #{cutoff}")
    long countCreatedAfter(@Param("cutoff") LocalDateTime cutoff);

    @Select("SELECT * FROM users WHERE deleted_at IS NULL " +
            "AND (display_name ILIKE CONCAT('%', #{search}, '%') OR email ILIKE CONCAT('%', #{search}, '%')) " +
            "ORDER BY created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<User> searchUsers(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

    @Select("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL " +
            "AND (display_name ILIKE CONCAT('%', #{search}, '%') OR email ILIKE CONCAT('%', #{search}, '%'))")
    int countSearchUsers(@Param("search") String search);

    @Select("SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT #{limit} OFFSET #{offset}")
    List<User> listUsers(@Param("limit") int limit, @Param("offset") int offset);

    @Select("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
    int countAllUsers();

    @Update("UPDATE users SET " +
            "karma_points = karma_points + #{points}, " +
            "report_count = report_count + #{reportInc}, " +
            "first_report_count = first_report_count + #{firstReportInc}, " +
            "correction_count = correction_count + #{correctionInc}, " +
            "updated_at = NOW() " +
            "WHERE id = #{userId} AND deleted_at IS NULL")
    int incrementKarma(@Param("userId") Long userId,
                       @Param("points") int points,
                       @Param("reportInc") int reportInc,
                       @Param("firstReportInc") int firstReportInc,
                       @Param("correctionInc") int correctionInc);
}
