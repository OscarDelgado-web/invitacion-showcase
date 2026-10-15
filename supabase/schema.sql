-- ==============================================================================
-- RETOS Showcase 2026 - 2nd Edition
-- Esquema de Base de Datos para Registro RSVP (Supabase / PostgreSQL)
-- Fuente de verdad: public.rsvp_registros
-- ==============================================================================

-- 1. Extensión para generación de UUIDs criptográficos (habilitada por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Creación de la tabla principal de registros RSVP
CREATE TABLE IF NOT EXISTS public.rsvp_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) >= 2 AND char_length(nombre) <= 120),
    asistencia TEXT NOT NULL CHECK (asistencia IN ('si', 'no')),
    rol TEXT NOT NULL CHECK (rol IN ('estudiante', 'docente', 'empresa', 'familiar', 'invitado')),
    organizacion TEXT NULL CHECK (organizacion IS NULL OR char_length(organizacion) <= 120),
    codigo TEXT NOT NULL UNIQUE,
    origen TEXT NULL DEFAULT 'web_showcase_2026'
);

-- Comentarios documentales en catálogo de PostgreSQL
COMMENT ON TABLE public.rsvp_registros IS 'Registros oficiales de confirmación de asistencia al RETOS Showcase 2026';
COMMENT ON COLUMN public.rsvp_registros.id IS 'Identificador único universal (UUID v4)';
COMMENT ON COLUMN public.rsvp_registros.nombre IS 'Nombre y apellido del asistente (validado 2-120 caracteres)';
COMMENT ON COLUMN public.rsvp_registros.asistencia IS 'Decisión de asistencia: si o no';
COMMENT ON COLUMN public.rsvp_registros.rol IS 'Perfil institucional: estudiante, docente, empresa, familiar, invitado';
COMMENT ON COLUMN public.rsvp_registros.organizacion IS 'Organización o institución de procedencia (opcional, <= 120 caracteres)';
COMMENT ON COLUMN public.rsvp_registros.codigo IS 'Código único de acreditación formato RETOS-XXXXXX';
COMMENT ON COLUMN public.rsvp_registros.origen IS 'Identificador de origen o campaña de la invitación (default web_showcase_2026)';

-- 3. Función y Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_rsvp_registros_updated_at ON public.rsvp_registros;

CREATE TRIGGER trigger_rsvp_registros_updated_at
    BEFORE UPDATE ON public.rsvp_registros
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Seguridad: Row Level Security (RLS) habilitado SIN políticas públicas
-- Esto garantiza que ni el rol 'anon' ni 'authenticated' puedan leer ni escribir datos directamente.
-- Únicamente la función serverless (service_role) tiene acceso mediante sus credenciales de entorno.
ALTER TABLE public.rsvp_registros ENABLE ROW LEVEL SECURITY;

-- Revocación preventiva de permisos públicos
REVOKE ALL ON TABLE public.rsvp_registros FROM anon;
REVOKE ALL ON TABLE public.rsvp_registros FROM authenticated;

-- Permisos exclusivos para el rol de servicio
GRANT ALL ON TABLE public.rsvp_registros TO service_role;
