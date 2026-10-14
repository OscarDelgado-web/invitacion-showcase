-- ==============================================================================
-- ACCESS GRANTED: RETOS Showcase 2026
-- Esquema de Base de Datos para Registro RSVP (Supabase / PostgreSQL)
-- ==============================================================================
-- Instrucciones de ejecución:
-- 1. Inicia sesión en https://supabase.com y selecciona tu proyecto.
-- 2. Dirígete a la pestaña "SQL Editor" en el menú lateral.
-- 3. Crea una "New query", pega la totalidad de este script y presiona "RUN".
-- ==============================================================================

-- 1. Extensión para generación de UUIDs criptográficos (habilitada por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Creación de la tabla principal de registros RSVP
CREATE TABLE IF NOT EXISTS public.rsvp_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) >= 2 AND char_length(nombre) <= 120),
    email TEXT NOT NULL CHECK (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    asistencia TEXT NOT NULL CHECK (asistencia IN ('si', 'no')),
    notas TEXT NULL CHECK (notas IS NULL OR char_length(notas) <= 500),
    codigo TEXT NOT NULL UNIQUE,
    origen TEXT NULL DEFAULT 'web_showcase_2026'
);

-- Comentarios documentales en catálogo de PostgreSQL
COMMENT ON TABLE public.rsvp_registros IS 'Registros oficiales de confirmación de asistencia al RETOS Showcase 2026';
COMMENT ON COLUMN public.rsvp_registros.id IS 'Identificador único universal (UUID v4)';
COMMENT ON COLUMN public.rsvp_registros.nombre IS 'Nombre y apellido del asistente (validado 2-120 caracteres)';
COMMENT ON COLUMN public.rsvp_registros.email IS 'Correo electrónico (validado RFC 5322 básico, <= 254 caracteres)';
COMMENT ON COLUMN public.rsvp_registros.asistencia IS 'Decisión de asistencia: si, quiza, no';
COMMENT ON COLUMN public.rsvp_registros.notas IS 'Notas adicionales u organización de procedencia (opcional, <= 500 caracteres)';
COMMENT ON COLUMN public.rsvp_registros.codigo IS 'Código único de acreditación formato RETOS-XXXX-<ESTADO>';
COMMENT ON COLUMN public.rsvp_registros.origen IS 'Identificador de origen o campaña de la invitación';

-- 3. Índice único sobre lower(email)
-- Permite que un reenvío con el mismo correo actualice la respuesta conservando el código
CREATE UNIQUE INDEX IF NOT EXISTS rsvp_registros_lower_email_idx
    ON public.rsvp_registros (lower(email));

-- 4. Función y Trigger para actualización automática de updated_at
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

-- 5. Seguridad: Row Level Security (RLS) habilitado SIN políticas públicas
-- Esto garantiza que ni el rol 'anon' ni 'authenticated' puedan leer ni escribir datos directamente.
-- Únicamente la función serverless (service_role) en Vercel tiene acceso mediante sus credenciales de entorno.
ALTER TABLE public.rsvp_registros ENABLE ROW LEVEL SECURITY;

-- Revocación preventiva de permisos públicos
REVOKE ALL ON TABLE public.rsvp_registros FROM anon;
REVOKE ALL ON TABLE public.rsvp_registros FROM authenticated;

-- Permisos exclusivos para el rol de servicio
GRANT ALL ON TABLE public.rsvp_registros TO service_role;

-- ==============================================================================
-- CONSULTAS DE EJEMPLO Y MONITOREO
-- ==============================================================================

-- Consulta 1: Conteo de asistencia por tipo (si / quiza / no)
-- SELECT asistencia, COUNT(*) AS total
-- FROM public.rsvp_registros
-- GROUP BY asistencia
-- ORDER BY total DESC;

-- Consulta 2: Listado de asistentes confirmados ('si') con fecha de actualización
-- SELECT nombre, email, codigo, notas, updated_at
-- FROM public.rsvp_registros
-- WHERE asistencia = 'si'
-- ORDER BY updated_at DESC;
