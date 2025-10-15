-- Add onboarding column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding boolean DEFAULT false NOT NULL;

-- Update existing users to have onboarding = false
UPDATE public.profiles 
SET onboarding = false 
WHERE onboarding IS NULL;

-- Update the handle_new_user trigger function to set onboarding = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, plan, onboarding)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'BASE',
    false
  );
  RETURN NEW;
END;
$$;