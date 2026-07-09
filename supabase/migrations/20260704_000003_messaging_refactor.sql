-- Ça Match — Messaging Refactor: Mission-Centric Chat
-- Separates conversation state, business phase, and flags into clean dimensions.
-- Adds call infrastructure, message type taxonomy, and moderation layer.

-- ============================================================================
-- 1. NEW ENUM TYPES
-- ============================================================================

CREATE TYPE IF NOT EXISTS conversation_state AS ENUM (
    'waiting',
    'active',
    'locked',
    'read_only',
    'archived'
);

CREATE TYPE IF NOT EXISTS message_type AS ENUM (
    'text', 'image', 'video', 'voice', 'pdf', 'location',
    'quote', 'invoice', 'payment', 'system', 'event'
);

CREATE TYPE IF NOT EXISTS call_type AS ENUM ('audio', 'video');

CREATE TYPE IF NOT EXISTS call_status AS ENUM (
    'dialing', 'ringing', 'connecting', 'connected',
    'ended', 'missed', 'declined', 'failed'
);

CREATE TYPE IF NOT EXISTS call_event_type AS ENUM (
    'ringing_started', 'call_accepted', 'media_established',
    'network_switched', 'call_ended', 'reconnecting', 'dropped'
);

CREATE TYPE IF NOT EXISTS moderation_action AS ENUM (
    'none', 'warned', 'blocked', 'reported', 'auto_escalated'
);

-- ============================================================================
-- 2. ALTER conversations
-- ============================================================================

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS state conversation_state NOT NULL DEFAULT 'waiting',
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Existing conversations linked to a job get 'active' state
UPDATE conversations SET state = 'active' WHERE job_id IS NOT NULL AND state = 'waiting';

-- ============================================================================
-- 3. ALTER messages
-- ============================================================================

-- sender_id becomes nullable: system/event messages have no sender
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- New taxonomy column
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS type message_type NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_duration INT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS risk_score INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_action moderation_action NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);

-- Enforce sender_id nullability by type
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_check;
ALTER TABLE messages ADD CONSTRAINT messages_sender_check
    CHECK (
        (type IN ('system', 'event') AND sender_id IS NULL) OR
        (type NOT IN ('system', 'event') AND sender_id IS NOT NULL)
    );

-- Drop old media_type CHECK and migrate values
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_media_type_check;

UPDATE messages SET type = 'image' WHERE media_type = 'image' AND type = 'text';
UPDATE messages SET type = 'video' WHERE media_type = 'video' AND type = 'text';
UPDATE messages SET type = 'voice' WHERE media_type = 'voice_note' AND type = 'text';

-- New indexes
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_risk ON messages(risk_score DESC) WHERE risk_score > 0;
CREATE INDEX IF NOT EXISTS idx_messages_moderation ON messages(moderation_action) WHERE moderation_action != 'none';

-- ============================================================================
-- 4. CALLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    caller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type call_type NOT NULL DEFAULT 'audio',
    status call_status NOT NULL DEFAULT 'dialing',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_secs INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_conversation ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- ============================================================================
-- 5. CALL PARTICIPANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    is_video_enabled BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_call_parts_call ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_parts_user ON call_participants(user_id);

-- ============================================================================
-- 6. CALL EVENTS (audit trail for call quality & analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type call_event_type NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_events_call ON call_events(call_id);

-- ============================================================================
-- 7. RLS POLICIES for new tables
-- ============================================================================

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

-- calls
CREATE POLICY "Participants view calls" ON calls
    FOR SELECT USING (
        caller_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Participants create calls" ON calls
    FOR INSERT WITH CHECK (
        caller_id = auth.uid()
    );

CREATE POLICY "Participants update own calls" ON calls
    FOR UPDATE USING (
        caller_id = auth.uid() OR receiver_id = auth.uid()
    );

-- call_participants
CREATE POLICY "Participants view call participants" ON call_participants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM calls c
                WHERE c.id = call_participants.call_id
                AND (c.caller_id = auth.uid() OR c.receiver_id = auth.uid()))
    );

CREATE POLICY "Users insert own participation" ON call_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- call_events
CREATE POLICY "Participants view call events" ON call_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM calls c
                WHERE c.id = call_events.call_id
                AND (c.caller_id = auth.uid() OR c.receiver_id = auth.uid()))
    );

CREATE POLICY "Participants create call events" ON call_events
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM calls c
                WHERE c.id = call_events.call_id
                AND (c.caller_id = auth.uid() OR c.receiver_id = auth.uid()))
    );

-- ============================================================================
-- 8. TRIGGER: auto-update conversations.updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. FUNCTION: insert system event message (for Edge Functions)
-- ============================================================================

CREATE OR REPLACE FUNCTION insert_system_event(
    p_conversation_id UUID,
    p_event_type TEXT,
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    INSERT INTO messages (conversation_id, sender_id, type, content, metadata)
    VALUES (
        p_conversation_id,
        NULL,
        'event',
        p_content,
        jsonb_build_object('event', p_event_type) || p_metadata
    )
    RETURNING id INTO v_message_id;

    UPDATE conversations
    SET last_message_at = NOW()
    WHERE id = p_conversation_id;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
