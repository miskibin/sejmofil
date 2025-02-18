CREATE TYPE vote_target AS ENUM ('process', 'print', 'person');

CREATE TABLE user_votes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    target_type vote_target NOT NULL,
    target_id INTEGER NOT NULL,
    value INTEGER NOT NULL CHECK (value IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one vote per user per target
    UNIQUE(user_id, target_type, target_id)
);

-- Index for fast lookups of user votes
CREATE INDEX idx_user_votes_lookup ON user_votes(target_type, target_id);
CREATE INDEX idx_user_votes_user ON user_votes(user_id);

-- Function to get vote counts for multiple targets
CREATE OR REPLACE FUNCTION get_vote_counts(p_target_type vote_target, p_target_ids INTEGER[])
RETURNS TABLE (
    target_id INTEGER,
    upvotes BIGINT,
    downvotes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.target_id,
        COUNT(*) FILTER (WHERE value = 1) as upvotes,
        COUNT(*) FILTER (WHERE value = -1) as downvotes
    FROM user_votes v
    WHERE v.target_type = p_target_type
    AND v.target_id = ANY(p_target_ids)
    GROUP BY v.target_id;
END;
$$ LANGUAGE plpgsql;
