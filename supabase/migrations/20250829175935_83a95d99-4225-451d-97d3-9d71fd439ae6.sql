-- Create profiles table (only if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles (only if not already enabled)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'profiles' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create prayer_completions table
CREATE TABLE IF NOT EXISTS public.prayer_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prayer_completions
ALTER TABLE public.prayer_completions ENABLE ROW LEVEL SECURITY;

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_type TEXT NOT NULL,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on habit_completions
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Create prayer_notifications table
CREATE TABLE IF NOT EXISTS public.prayer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  cadence TEXT NOT NULL,
  notification_time TIME WITHOUT TIME ZONE NOT NULL,
  notification_id INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prayer_notifications
ALTER TABLE public.prayer_notifications ENABLE ROW LEVEL SECURITY;

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  responses JSONB NOT NULL,
  results JSONB NOT NULL,
  parent_email TEXT,
  teen_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;