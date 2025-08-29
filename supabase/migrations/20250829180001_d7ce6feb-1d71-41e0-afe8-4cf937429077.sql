-- Add RLS policies for prayer_completions
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_completions' AND policyname = 'Users can view their own prayer completions') THEN
    CREATE POLICY "Users can view their own prayer completions" 
    ON public.prayer_completions 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_completions' AND policyname = 'Users can create their own prayer completions') THEN
    CREATE POLICY "Users can create their own prayer completions" 
    ON public.prayer_completions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_completions' AND policyname = 'Users can update their own prayer completions') THEN
    CREATE POLICY "Users can update their own prayer completions" 
    ON public.prayer_completions 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_completions' AND policyname = 'Users can delete their own prayer completions') THEN
    CREATE POLICY "Users can delete their own prayer completions" 
    ON public.prayer_completions 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for habit_completions
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Users can view their own habit completions') THEN
    CREATE POLICY "Users can view their own habit completions" 
    ON public.habit_completions 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Users can create their own habit completions') THEN
    CREATE POLICY "Users can create their own habit completions" 
    ON public.habit_completions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Users can update their own habit completions') THEN
    CREATE POLICY "Users can update their own habit completions" 
    ON public.habit_completions 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Users can delete their own habit completions') THEN
    CREATE POLICY "Users can delete their own habit completions" 
    ON public.habit_completions 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for prayer_notifications
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_notifications' AND policyname = 'Users can view their own prayer notifications') THEN
    CREATE POLICY "Users can view their own prayer notifications" 
    ON public.prayer_notifications 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_notifications' AND policyname = 'Users can create their own prayer notifications') THEN
    CREATE POLICY "Users can create their own prayer notifications" 
    ON public.prayer_notifications 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_notifications' AND policyname = 'Users can update their own prayer notifications') THEN
    CREATE POLICY "Users can update their own prayer notifications" 
    ON public.prayer_notifications 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_notifications' AND policyname = 'Users can delete their own prayer notifications') THEN
    CREATE POLICY "Users can delete their own prayer notifications" 
    ON public.prayer_notifications 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for assessments
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Allow public inserts') THEN
    CREATE POLICY "Allow public inserts" 
    ON public.assessments 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Allow public reads') THEN
    CREATE POLICY "Allow public reads" 
    ON public.assessments 
    FOR SELECT 
    USING (true);
  END IF;
END $$;