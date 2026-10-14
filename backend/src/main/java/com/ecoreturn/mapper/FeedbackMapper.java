package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.Feedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface FeedbackMapper extends BaseMapper<Feedback> {

    @Select({"<script>",
            "SELECT f.*, u.display_name as reporter_name, u.email as reporter_email ",
            "FROM feedback f ",
            "LEFT JOIN users u ON f.user_id = u.id ",
            "<if test='type != null and type != \"\"'>WHERE f.type = #{type} </if>",
            "ORDER BY f.created_at DESC LIMIT #{limit} OFFSET #{offset}",
            "</script>"})
    List<Map<String, Object>> listFeedbackWithDetails(
            @Param("type") String type,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Select({"<script>",
            "SELECT COUNT(*) FROM feedback ",
            "<if test='type != null and type != \"\"'>WHERE type = #{type}</if>",
            "</script>"})
    int countFeedback(@Param("type") String type);
}
