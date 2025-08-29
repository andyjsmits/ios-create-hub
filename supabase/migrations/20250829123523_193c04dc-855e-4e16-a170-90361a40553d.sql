-- Create habit_completions table
CREATE TABLE public.habit_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    habit_type TEXT NOT NULL,
    completion_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prayer_completions table  
CREATE TABLE public.prayer_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    person_name TEXT NOT NULL,
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for habit_completions
CREATE POLICY "Users can view their own habit completions" 
ON public.habit_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit completions" 
ON public.habit_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions" 
ON public.habit_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions" 
ON public.habit_completions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for prayer_completions
CREATE POLICY "Users can view their own prayer completions" 
ON public.prayer_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prayer completions" 
ON public.prayer_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer completions" 
ON public.prayer_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer completions" 
ON public.prayer_completions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_habit_completions_updated_at
BEFORE UPDATE ON public.habit_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prayer_completions_updated_at
BEFORE UPDATE ON public.prayer_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();