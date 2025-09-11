-- Add day_of_week column to prayer_notifications table
ALTER TABLE public.prayer_notifications 
ADD COLUMN IF NOT EXISTS day_of_week INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN public.prayer_notifications.day_of_week IS 'Day of week (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_prayer_notifications_day_of_week 
ON public.prayer_notifications (day_of_week);