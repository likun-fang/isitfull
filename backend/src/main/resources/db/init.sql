-- Database initialization script for Eco-Return Ireland
-- Requires PostgreSQL with PostGIS extension

-- Enable PostGIS extension for geographic data support
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- RVM (Reverse Vending Machine) Table
-- =============================================================================
CREATE TABLE rvm (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    location GEOGRAPHY(POINT, 4326),
    open_hours JSONB,
    status VARCHAR(20) DEFAULT 'UNKNOWN',
    queue_length VARCHAR(10),
    confidence_score DECIMAL(5,2) DEFAULT 50,
    status_updated_at TIMESTAMP,
    last_calculated_at TIMESTAMP,
    admin_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rvm_location ON rvm USING GIST(location);
CREATE INDEX idx_rvm_status ON rvm(status);
CREATE INDEX idx_rvm_external_id ON rvm(external_id);
CREATE INDEX idx_rvm_city ON rvm(city);

-- =============================================================================
-- Device Table (for anonymous tracking)
-- =============================================================================
CREATE TABLE device (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    reputation INTEGER DEFAULT 100,
    report_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_device_id ON device(device_id);

-- =============================================================================
-- Users Table (unified guest + social login)
-- =============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    karma_points INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    first_report_count INTEGER DEFAULT 0,
    correction_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_users_karma ON users(karma_points DESC);

-- =============================================================================
-- Admin Users Table (separate from app users)
-- =============================================================================
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- =============================================================================
-- Report Table (crowdsourced status reports)
-- =============================================================================
CREATE TABLE report (
    id BIGSERIAL PRIMARY KEY,
    rvm_id BIGINT REFERENCES rvm(id),
    user_id BIGINT REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    distance_meters INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    queue_length VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_rvm_id ON report(rvm_id);
CREATE INDEX idx_report_user ON report(user_id);
CREATE INDEX idx_report_created_at ON report(created_at DESC);
CREATE INDEX idx_report_rvm_created ON report(rvm_id, created_at DESC);
CREATE INDEX idx_report_verified ON report(verified);

-- =============================================================================
-- RVM Issue Report Table
-- =============================================================================
CREATE TABLE rvm_issue_report (
    id BIGSERIAL PRIMARY KEY,
    rvm_id BIGINT NOT NULL REFERENCES rvm(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    reason VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    resolution VARCHAR(20),
    resolved_by BIGINT REFERENCES admin_users(id),
    resolved_at TIMESTAMP,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rvm_issue_rvm_id ON rvm_issue_report(rvm_id);
CREATE INDEX idx_rvm_issue_user_rvm ON rvm_issue_report(user_id, rvm_id);
CREATE INDEX idx_rvm_issue_status ON rvm_issue_report(status);

-- =============================================================================
-- Karma Logs Table
-- =============================================================================
CREATE TABLE karma_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    reason VARCHAR(20) NOT NULL,
    ref_type VARCHAR(20),
    ref_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_karma_logs_user ON karma_logs(user_id, created_at DESC);

-- =============================================================================
-- Refresh Tokens Table
-- =============================================================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- =============================================================================
-- User Favorites Table
-- =============================================================================
CREATE TABLE user_favorites (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rvm_id BIGINT NOT NULL REFERENCES rvm(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, rvm_id)
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id);

-- =============================================================================
-- Admin Audit Log Table
-- =============================================================================
CREATE TABLE admin_audit_log (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES admin_users(id),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(30),
    target_id BIGINT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_created_at ON admin_audit_log(created_at);

-- =============================================================================
-- Seed default admin (password: changeme123)
-- =============================================================================
INSERT INTO admin_users (username, password_hash, display_name)
VALUES ('admin', '$2b$10$ObbkwZ4gM66duYTP0wuSwuZ4RnwvWBKU1/M5wVpAXInJQ6G7f6vLy', 'System Admin');

-- =============================================================================
-- Feedback Table
-- =============================================================================
CREATE TABLE feedback (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(20)  NOT NULL,
    message     TEXT         NOT NULL,
    screenshot_url VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_type ON feedback(type);
