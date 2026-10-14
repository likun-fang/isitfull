package com.ecoreturn.controller;

import com.ecoreturn.config.UserContext;
import com.ecoreturn.entity.User;
import com.ecoreturn.mapper.KarmaLogMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private static final Long USER_ID = 42L;

    @Mock
    private KarmaLogMapper karmaLogMapper;

    private UserController controller;

    @BeforeEach
    void setUp() {
        // Reading karma logs uses neither UserService nor DisplayNameValidator
        controller = new UserController(null, karmaLogMapper, null);
        User user = new User();
        user.setId(USER_ID);
        UserContext.setCurrentUser(user);
    }

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void karmaLogs_pageSizeAbove100_isCappedAt100() {
        controller.getKarmaLogs(0, 999);

        verify(karmaLogMapper).findByUserIdWithRvmName(USER_ID, 100, 0);
    }

    @Test
    void karmaLogs_offsetUsesTheCappedPageSize() {
        controller.getKarmaLogs(2, 999);

        verify(karmaLogMapper).findByUserIdWithRvmName(USER_ID, 100, 200);
    }

    @Test
    void karmaLogs_pageSizeBelow1_isRaisedTo1() {
        controller.getKarmaLogs(0, 0);

        verify(karmaLogMapper).findByUserIdWithRvmName(USER_ID, 1, 0);
    }

    @Test
    void karmaLogs_negativePage_readsTheFirstPage() {
        controller.getKarmaLogs(-3, 20);

        verify(karmaLogMapper).findByUserIdWithRvmName(USER_ID, 20, 0);
    }
}
