-- Create habits table to store user habits data
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('pray', 'union', 'listen', 'serve', 'echo')),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own habits" 
ON public.habits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" 
ON public.habits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
ON public.habits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
ON public.habits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create prayer_notifications table to track scheduled notifications
CREATE TABLE public.prayer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('daily', 'weekly')),
  notification_time TIME NOT NULL,
  notification_id INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for prayer notifications
ALTER TABLE public.prayer_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer notifications
CREATE POLICY "Users can view their own prayer notifications" 
ON public.prayer_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prayer notifications" 
ON public.prayer_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer notifications" 
ON public.prayer_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer notifications" 
ON public.prayer_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for prayer notifications timestamp updates
CREATE TRIGGER update_prayer_notifications_updated_at
BEFORE UPDATE ON public.prayer_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();