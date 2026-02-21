-- ============================================
-- Onboarding Digital Premium — Setup Supabase
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query > pegar y ejecutar)
--
-- Si algún comando da error "already exists", ignóralo y sigue.
-- ============================================

-- 1. Crear bucket "logos" (público, para subida de archivos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar unique constraint del user_id (permite múltiples proyectos por usuario)
ALTER TABLE public.business_data DROP CONSTRAINT IF EXISTS business_data_user_id_key;

-- 3. Policy SELECT en business_data (leer datos propios)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_data' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON public.business_data
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Policy INSERT en business_data (crear datos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_data' AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data" ON public.business_data
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Policy UPDATE en business_data (actualizar datos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_data' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON public.business_data
      FOR UPDATE USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Storage: usuarios autenticados pueden subir archivos en su carpeta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload logos'
  ) THEN
    CREATE POLICY "Users can upload logos" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- 7. Storage: acceso público de lectura a los logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public read access to logos'
  ) THEN
    CREATE POLICY "Public read access to logos" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'logos');
  END IF;
END $$;

-- ============================================
-- ¡Listo! Todas las políticas y el bucket están configurados.
-- ============================================
