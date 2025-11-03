-- Add review_comments column to abstracts table
-- This allows faculty to provide feedback that students can see

ALTER TABLE abstracts 
ADD COLUMN IF NOT EXISTS review_comments TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN abstracts.review_comments IS 'Faculty feedback/comments visible to students about their abstract submission';
