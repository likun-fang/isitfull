package com.ecoreturn.service;

import com.ecoreturn.mapper.FeedbackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminFeedbackService {

    private final FeedbackMapper feedbackMapper;

    public List<Map<String, Object>> listFeedback(String type, int page, int size) {
        int offset = (page - 1) * size;
        return feedbackMapper.listFeedbackWithDetails(type, size, offset);
    }

    public int countFeedback(String type) {
        return feedbackMapper.countFeedback(type);
    }
}
