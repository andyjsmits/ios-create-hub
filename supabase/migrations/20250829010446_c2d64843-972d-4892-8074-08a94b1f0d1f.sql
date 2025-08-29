-- Add day of week tracking for weekly prayers in habits table
-- This will store which day of the week (1-7) a person should be prayed for on weekly basis

-- Add a new table for prayer completions that tracks who was prayed for
CREATE TABLE public.prayer_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, person_name, completion_date)
);

-- Enable Row Level Security
ALTER TABLE public.prayer_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer completions
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prayer_completions_updated_at
BEFORE UPDATE ON public.prayer_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_prayer_completions_user_date ON public.prayer_completions(user_id, completion_date);
CREATE INDEX idx_prayer_completions_user_person ON public.prayer_completions(user_id, person_name);