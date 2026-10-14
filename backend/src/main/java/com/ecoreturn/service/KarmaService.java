package com.ecoreturn.service;

import com.ecoreturn.entity.KarmaLog;
import com.ecoreturn.enums.KarmaReason;
import com.ecoreturn.mapper.KarmaLogMapper;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KarmaService {

    private final UserMapper userMapper;
    private final KarmaLogMapper karmaLogMapper;

    @Transactional
    public void awardKarma(Long userId, KarmaReason reason, String refType, Long refId) {
        awardKarma(userId, reason.getDefaultPoints(), reason, refType, refId);
    }

    @Transactional
    public void awardKarma(Long userId, int points, KarmaReason reason,
                          String refType, Long refId) {
        if (userId == null) {
            log.warn("Cannot award karma to null userId");
            return;
        }

        // Atomic increment — no SELECT needed, no optimistic lock contention
        int reportInc = reason == KarmaReason.REPORT ? 1 : 0;
        int firstReportInc = reason == KarmaReason.FIRST_REPORT ? 1 : 0;
        int correctionInc = reason == KarmaReason.CORRECTION ? 1 : 0;

        int affected = userMapper.incrementKarma(userId, points,
            reportInc, firstReportInc, correctionInc);

        if (affected == 0) {
            log.warn("Cannot award karma to non-existent or deleted user: {}", userId);
            return;
        }

        // Log karma change
        KarmaLog karmaLog = new KarmaLog();
        karmaLog.setUserId(userId);
        karmaLog.setPoints(points);
        karmaLog.setReason(reason);
        karmaLog.setRefType(refType);
        karmaLog.setRefId(refId);
        karmaLogMapper.insert(karmaLog);

        log.info("Awarded {} karma to user {} for {}", points, userId, reason);
    }
}
