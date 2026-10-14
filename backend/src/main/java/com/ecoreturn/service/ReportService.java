package com.ecoreturn.service;

import com.ecoreturn.dto.ReportRequestDto;
import com.ecoreturn.dto.ReportResponseDto;
import com.ecoreturn.dto.RvmStatusResult;
import com.ecoreturn.entity.Report;
import com.ecoreturn.entity.Rvm;
import com.ecoreturn.entity.User;
import com.ecoreturn.enums.KarmaReason;
import com.ecoreturn.enums.RvmStatus;
import com.ecoreturn.enums.UserRank;
import com.ecoreturn.event.ReportCreatedEvent;
import com.ecoreturn.exception.GeofenceException;
import com.ecoreturn.mapper.ReportMapper;
import com.ecoreturn.mapper.RvmMapper;
import com.ecoreturn.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final ReportMapper reportMapper;
    private final UserMapper userMapper;
    private final RvmService rvmService;
    private final GeofenceService geofenceService;
    private final RateLimitService rateLimitService;
    private final FirstReportChecker firstReportChecker;
    private final RvmMapper rvmMapper;
    private final StatusCalculationService statusCalculationService;
    private final RvmGeoService rvmGeoService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ReportResponseDto createReport(Long rvmId, Long userId, ReportRequestDto request) {
        // Check rate limit (skip if userId is null for anonymous reports)
        if (userId != null) {
            rateLimitService.checkRateLimit(userId, rvmId);
        }

        // Get RVM
        Rvm rvm = rvmService.findEntityById(rvmId);
        if (rvm == null) {
            throw new IllegalArgumentException("RVM not found");
        }

        if (rvm.getStatus() == RvmStatus.REMOVED) {
            throw new IllegalArgumentException("This machine has been removed and cannot receive reports");
        }

        // Check geofence
        boolean verified = geofenceService.isWithinGeofence(
            rvm,
            request.getLatitude().doubleValue(),
            request.getLongitude().doubleValue()
        );

        if (!verified) {
            throw new GeofenceException("You are more than 150m from this RVM.");
        }

        // Calculate distance
        int distance = geofenceService.calculateDistance(
            rvm.getLatitude(), rvm.getLongitude(),
            request.getLatitude().doubleValue(), request.getLongitude().doubleValue()
        );

        // Gather info needed for async karma processing
        boolean isFirstReport = firstReportChecker.isFirstReport(rvmId);
        RvmStatus previousStatus = rvm.getStatus();

        // Create report
        Report report = new Report();
        report.setRvmId(rvmId);
        report.setUserId(userId);
        report.setStatus(request.getStatus());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setDistanceMeters(distance);
        report.setVerified(verified);
        report.setQueueLength(request.getQueueLength());
        // createdAt is auto-filled by MyBatisMetaObjectHandler

        reportMapper.insert(report);

        // Record for first-report tracking
        firstReportChecker.recordReport(rvmId);

        // Record rate limit
        if (userId != null) {
            rateLimitService.recordReport(userId, rvmId);
        }

        // Immediately recalculate status (synchronous -- preserves real-time UX)
        if (!Boolean.TRUE.equals(rvm.getAdminLocked())) {
            try {
                RvmStatusResult statusResult = statusCalculationService.calculateStatus(rvmId);
                rvmMapper.updateStatus(rvmId, statusResult.getStatus(), statusResult.getConfidence(),
                        statusResult.getQueueLength(), statusResult.getLastReportTime());
                rvmGeoService.updateStatus(rvmId, statusResult.getStatus(), statusResult.getConfidence(),
                        statusResult.getQueueLength(), statusResult.getLastReportTime());
            } catch (Exception e) {
                log.warn("Failed to update RVM status after report: {}", e.getMessage());
            }
        }

        // Publish event for async karma processing (fires after transaction commits)
        eventPublisher.publishEvent(new ReportCreatedEvent(
            this, report.getId(), rvmId, userId,
            request.getStatus(), previousStatus, isFirstReport));

        // Calculate expected karma for response (no DB query needed)
        int karmaAwarded = 0;
        if (userId != null) {
            karmaAwarded += KarmaReason.REPORT.getDefaultPoints();
            if (isFirstReport) karmaAwarded += KarmaReason.FIRST_REPORT.getDefaultPoints();
            if (previousStatus == RvmStatus.BROKEN && request.getStatus() == RvmStatus.AVAILABLE) {
                karmaAwarded += KarmaReason.CORRECTION.getDefaultPoints();
            }
        }

        log.info("Report created: RVM {} reported as {} by user {} (verified={}, distance={}m)",
                rvmId, request.getStatus(), userId, verified, distance);

        // Calculate level-up info from current karma + awarded karma
        Integer totalKarma = null;
        boolean leveledUp = false;
        UserRank previousRank = null;
        UserRank newRank = null;

        if (userId != null && karmaAwarded > 0) {
            User user = userMapper.selectById(userId);
            if (user != null) {
                int currentKarma = user.getKarmaPoints() != null ? user.getKarmaPoints() : 0;
                totalKarma = currentKarma + karmaAwarded;
                previousRank = UserRank.fromKarma(currentKarma);
                newRank = UserRank.fromKarma(totalKarma);
                leveledUp = newRank != previousRank;
            }
        }

        ReportResponseDto responseDto = ReportResponseDto.builder()
            .reportId(report.getId())
            .verified(verified)
            .message("Thank you! You just saved someone a wasted trip.")
            .karmaAwarded(karmaAwarded)
            .totalKarma(totalKarma)
            .leveledUp(leveledUp)
            .previousRank(leveledUp ? previousRank : null)
            .newRank(leveledUp ? newRank : null)
            .build();

        log.info("Report response: {}", responseDto);

        return responseDto;
    }
}
