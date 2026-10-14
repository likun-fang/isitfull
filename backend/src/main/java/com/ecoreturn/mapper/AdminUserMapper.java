package com.ecoreturn.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecoreturn.entity.AdminUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminUserMapper extends BaseMapper<AdminUser> {

    @Select("SELECT * FROM admin_users WHERE username = #{username}")
    AdminUser findByUsername(@Param("username") String username);
}
