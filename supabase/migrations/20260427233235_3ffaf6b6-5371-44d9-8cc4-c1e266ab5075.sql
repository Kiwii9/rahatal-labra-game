alter table public.rooms
  add column if not exists current_question_idx int,
  add column if not exists answer_revealed boolean not null default false;