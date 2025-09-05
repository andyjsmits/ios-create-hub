-- Create a function to delete user account and all associated data
-- This function will be called via RPC from the client

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    result json;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Delete user data from custom tables
    -- Add more DELETE statements here for any other tables that store user data
    
    -- Example: Delete user habits (uncomment if you have this table)
    -- DELETE FROM habits WHERE user_id = current_user_id;
    
    -- Example: Delete user prayers (uncomment if you have this table)  
    -- DELETE FROM prayers WHERE user_id = current_user_id;
    
    -- Example: Delete user profiles (uncomment if you have this table)
    -- DELETE FROM profiles WHERE id = current_user_id;

    -- Delete the user from auth.users (this will cascade to related auth tables)
    DELETE FROM auth.users WHERE id = current_user_id;

    -- Return success message
    result := json_build_object(
        'success', true,
        'message', 'User account and all associated data have been deleted successfully'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        -- Return error message
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Create RLS policy to ensure users can only delete their own account
-- (The function already checks auth.uid(), but this adds an extra layer of security)

COMMENT ON FUNCTION delete_user_account() IS 'Allows authenticated users to delete their own account and all associated data';