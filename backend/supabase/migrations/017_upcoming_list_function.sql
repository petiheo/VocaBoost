-- This is the MODIFIED version.
-- It now filters for reviews between tomorrow and 7 days from now.

CREATE OR REPLACE FUNCTION get_upcoming_review_lists(
    p_user_id UUID,
    p_limit INT,
    p_offset INT
)
RETURNS TABLE (
    "listId" UUID,
    title TEXT,
    "wordCount" INT,
    creator JSON,
    "next_review_in_days" INT
) AS $$
BEGIN
    RETURN QUERY
    WITH list_next_review AS (
        -- For each list, find the soonest (minimum) next_review_date for the given user
        SELECT
            p.list_id,
            MIN(p.next_review_date) as next_review_date
        FROM
            public.user_word_progress p
        WHERE
            p.user_id = p_user_id
            -- CRITICAL FILTER:
            -- Only consider words with a review date that is AFTER today.
            -- We use NOW()::DATE + 1 to get the start of tomorrow.
            AND p.next_review_date >= (NOW()::DATE + 1)
            -- AND only consider words due in the next 7 days from tomorrow.
            AND p.next_review_date < (NOW()::DATE + 8)
        GROUP BY
            p.list_id
    )
    SELECT
        vl.id AS "listId",
        vl.title,
        vl.word_count AS "wordCount",
        json_build_object('display_name', u.display_name) AS creator,
        -- Calculate the difference in days from now. Since we've filtered, it will be >= 1.
        GREATEST(1, DATE_PART('day', lnr.next_review_date - NOW()))::INT AS "next_review_in_days"
    FROM
        public.vocab_lists vl
    JOIN
        list_next_review lnr ON vl.id = lnr.list_id
    LEFT JOIN
        public.users u ON vl.creator_id = u.id
    WHERE
        vl.is_active = TRUE
    ORDER BY
        "next_review_in_days" ASC, vl.updated_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;

CREATE OR REPLACE FUNCTION count_distinct_lists_for_user_progress(
    p_user_id UUID
)
RETURNS INT AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT p.list_id)
        FROM public.user_word_progress p
        WHERE
            p.user_id = p_user_id
            -- Add the same filter here for consistency
            AND p.next_review_date >= (NOW()::DATE + 1)
            AND p.next_review_date < (NOW()::DATE + 8)
    );
END;
$$ LANGUAGE plpgsql;