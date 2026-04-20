-- ====================================================
-- ToDo ADHD - Supabase Schema
-- Supabase の SQL Editor で実行してください
-- ====================================================

-- 1. tasks テーブル
CREATE TABLE public.tasks (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             text        NOT NULL,
  description       text,
  parent_task_id    uuid        REFERENCES public.tasks(id) ON DELETE SET NULL,
  priority          text        NOT NULL CHECK (priority IN ('high','medium','low')),
  estimated_minutes integer     NOT NULL,
  status            text        NOT NULL DEFAULT 'todo'
                                CHECK (status IN ('todo','in_progress','done','skipped')),
  is_top3           boolean     NOT NULL DEFAULT false,
  top3_order        smallint    CHECK (top3_order IN (1,2,3)),
  due_date          timestamptz,
  completed_at      timestamptz,
  postpone_count    integer     NOT NULL DEFAULT 0,
  reason            text,
  tags              text[]      NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  client_id         text        UNIQUE
);

-- 2. user_settings テーブル
CREATE TABLE public.user_settings (
  user_id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date          date,
  expected_lifespan   integer     NOT NULL DEFAULT 85,
  show_life_countdown boolean     NOT NULL DEFAULT false,
  theme               text        NOT NULL DEFAULT 'dark'
                                  CHECK (theme IN ('light','dark','auto')),
  display_name        text        NOT NULL DEFAULT '',
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 3. updated_at トリガー関数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 4. Row Level Security
ALTER TABLE public.tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks: owner only"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings: owner only"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. インデックス
CREATE INDEX tasks_user_id_status_idx ON public.tasks(user_id, status);
CREATE INDEX tasks_due_date_idx       ON public.tasks(user_id, due_date)
  WHERE due_date IS NOT NULL;
