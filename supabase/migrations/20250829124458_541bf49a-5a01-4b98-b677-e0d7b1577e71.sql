-- Force PostgREST schema reload by updating a system comment
COMMENT ON TABLE public.prayer_completions IS 'Prayer completions table - schema reload trigger';
COMMENT ON TABLE public.habit_completions IS 'Habit completions table - schema reload trigger';

-- Also notify any listeners about schema changes
NOTIFY pgrst, 'reload schema';