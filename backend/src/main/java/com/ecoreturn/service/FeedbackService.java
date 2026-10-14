package com.ecoreturn.service;

import com.ecoreturn.entity.Feedback;
import com.ecoreturn.enums.FeedbackType;
import com.ecoreturn.mapper.FeedbackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackMapper feedbackMapper;

    @Autowired(required = false)
    private OciStorageService ociStorageService;

    public String createFeedback(Long userId, FeedbackType type, String message,
                                 MultipartFile screenshot) {
        Feedback feedback = new Feedback();
        feedback.setUserId(userId);
        feedback.setType(type);
        feedback.setMessage(message);

        if (screenshot != null && !screenshot.isEmpty()) {
            if (ociStorageService == null) {
                log.warn("OCI storage not configured — screenshot will be ignored");
            } else {
                try {
                    String screenshotUrl = ociStorageService.uploadScreenshot(screenshot);
                    feedback.setScreenshotUrl(screenshotUrl);
                } catch (Exception e) {
                    log.error("Failed to upload feedback screenshot", e);
                }
            }
        }

        feedbackMapper.insert(feedback);

        return type == FeedbackType.BUG
                ? "Thanks for reporting this bug! We'll look into it."
                : "Thanks for your suggestion! We appreciate your feedback.";
    }
}
