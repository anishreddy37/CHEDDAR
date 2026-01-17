-- Create a function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, country, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'country', 'US'),
    coalesce(new.raw_user_meta_data->>'currency', 'USD')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
