USE [ENACAL_Project];
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.Auth_Users', 'Crew_ID') IS NULL
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD Crew_ID INT NULL;
END;

-- Quitar constraints viejos antes de normalizar datos
IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = 'CK_Auth_Users_Relationship'
)
BEGIN
    ALTER TABLE dbo.Auth_Users DROP CONSTRAINT CK_Auth_Users_Relationship;
END;

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = 'CK_Auth_Users_Role'
)
BEGIN
    ALTER TABLE dbo.Auth_Users DROP CONSTRAINT CK_Auth_Users_Role;
END;

-- Normaliza datos existentes antes de crear nuevos CHECK constraints
-- Mapeo recomendado para roles antiguos
UPDATE dbo.Auth_Users
SET [Role] = 'cliente'
WHERE [Role] = 'cliente';

UPDATE dbo.Auth_Users
SET [Role] = 'cuadrilla'
WHERE [Role] = 'trabajador'
    AND Crew_ID IS NOT NULL;

UPDATE dbo.Auth_Users
SET [Role] = 'lider_cuadrilla'
WHERE [Role] = 'trabajador'
    AND Crew_ID IS NULL
    AND Leader_Crew_ID IS NOT NULL;

UPDATE dbo.Auth_Users
SET [Role] = 'administrador'
WHERE [Role] = 'trabajador'
    AND Crew_ID IS NULL
    AND Leader_Crew_ID IS NULL
    AND Client_ID IS NULL;

-- Si hubiera registros con rol no esperado, los envía a administrador
UPDATE dbo.Auth_Users
SET [Role] = 'administrador'
WHERE [Role] NOT IN ('cliente', 'administrador', 'director_it', 'cuadrilla', 'lider_cuadrilla');

-- Ajustes de consistencia para rol cliente
UPDATE dbo.Auth_Users
SET Leader_Crew_ID = NULL,
        Crew_ID = NULL
WHERE [Role] = 'cliente';

-- Ajustes de consistencia para rol lider_cuadrilla
UPDATE dbo.Auth_Users
SET Client_ID = NULL,
        Crew_ID = NULL
WHERE [Role] = 'lider_cuadrilla';

-- Ajustes de consistencia para rol cuadrilla
UPDATE dbo.Auth_Users
SET Client_ID = NULL,
        Leader_Crew_ID = NULL
WHERE [Role] = 'cuadrilla';

-- Ajustes de consistencia para administrador/director
UPDATE dbo.Auth_Users
SET Client_ID = NULL,
        Leader_Crew_ID = NULL,
        Crew_ID = NULL
WHERE [Role] IN ('administrador', 'director_it');

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = 'FK_Auth_Users_Crews'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT FK_Auth_Users_Crews
        FOREIGN KEY (Crew_ID) REFERENCES dbo.Crews (Crew_ID);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = 'UX_Auth_Users_Crew_ID'
      AND object_id = OBJECT_ID('dbo.Auth_Users')
)
BEGIN
    CREATE UNIQUE INDEX UX_Auth_Users_Crew_ID
        ON dbo.Auth_Users (Crew_ID)
        WHERE Crew_ID IS NOT NULL;
END;

ALTER TABLE dbo.Auth_Users
ADD CONSTRAINT CK_Auth_Users_Role
CHECK ([Role] IN ('cliente', 'administrador', 'director_it', 'cuadrilla', 'lider_cuadrilla'));

ALTER TABLE dbo.Auth_Users
ADD CONSTRAINT CK_Auth_Users_Relationship
CHECK (
    ([Role] = 'cliente' AND Client_ID IS NOT NULL AND Leader_Crew_ID IS NULL AND Crew_ID IS NULL)
    OR
    ([Role] = 'lider_cuadrilla' AND Leader_Crew_ID IS NOT NULL AND Client_ID IS NULL AND Crew_ID IS NULL)
    OR
    ([Role] = 'cuadrilla' AND Crew_ID IS NOT NULL AND Client_ID IS NULL AND Leader_Crew_ID IS NULL)
    OR
    ([Role] IN ('administrador', 'director_it') AND Client_ID IS NULL AND Leader_Crew_ID IS NULL AND Crew_ID IS NULL)
);

COMMIT TRANSACTION;
GO
