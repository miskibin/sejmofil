-- Create reactions table for statements and processes
CREATE TABLE IF NOT EXISTS public.reactions (
  id BIGSERIAL PRIMARY KEY,
  target_id BIGINT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('statement', 'process')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure unique reaction per user per target
  UNIQUE(target_id, target_type, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON public.reactions(emoji);

-- Add RLS policies
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all reactions
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

-- Policy: Users can insert their own reactions
CREATE POLICY "Users can insert their own reactions" ON public.reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reactions
CREATE POLICY "Users can update their own reactions" ON public.reactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" ON public.reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to get reaction counts
CREATE OR REPLACE FUNCTION get_reaction_counts(
  p_target_id BIGINT,
  p_target_type TEXT
)
RETURNS TABLE(emoji TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.emoji, COUNT(*)::BIGINT as count
  FROM public.reactions r
  WHERE r.target_id = p_target_id 
    AND r.target_type = p_target_type
  GROUP BY r.emoji
  ORDER BY count DESC, r.emoji;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to toggle reactions (add if not exists, remove if exists, or switch emoji)
CREATE OR REPLACE FUNCTION toggle_reaction(
  p_target_id BIGINT,
  p_target_type TEXT,
  p_user_id UUID,
  p_emoji TEXT
)
RETURNS TABLE(success BOOLEAN, action TEXT, error TEXT) AS $$
DECLARE
  existing_reaction_emoji TEXT;
BEGIN
  -- Check if user already has a reaction for this target
  SELECT emoji INTO existing_reaction_emoji
  FROM public.reactions
  WHERE target_id = p_target_id 
    AND target_type = p_target_type 
    AND user_id = p_user_id;
    
  IF existing_reaction_emoji IS NULL THEN
    -- No existing reaction, add new one
    INSERT INTO public.reactions (target_id, target_type, user_id, emoji)
    VALUES (p_target_id, p_target_type, p_user_id, p_emoji);
    
    RETURN QUERY SELECT true as success, 'added'::TEXT as action, NULL::TEXT as error;
    
  ELSIF existing_reaction_emoji = p_emoji THEN
    -- Same emoji, remove the reaction
    DELETE FROM public.reactions
    WHERE target_id = p_target_id 
      AND target_type = p_target_type 
      AND user_id = p_user_id;
      
    RETURN QUERY SELECT true as success, 'removed'::TEXT as action, NULL::TEXT as error;
    
  ELSE
    -- Different emoji, update the reaction
    UPDATE public.reactions
    SET emoji = p_emoji, updated_at = NOW()
    WHERE target_id = p_target_id 
      AND target_type = p_target_type 
      AND user_id = p_user_id;
      
    RETURN QUERY SELECT true as success, 'updated'::TEXT as action, NULL::TEXT as error;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false as success, NULL::TEXT as action, SQLERRM::TEXT as error;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's reaction for a target
CREATE OR REPLACE FUNCTION get_user_reaction(
  p_target_id BIGINT,
  p_target_type TEXT,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  user_emoji TEXT;
BEGIN
  SELECT emoji INTO user_emoji
  FROM public.reactions
  WHERE target_id = p_target_id 
    AND target_type = p_target_type 
    AND user_id = p_user_id;
    
  RETURN user_emoji;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;