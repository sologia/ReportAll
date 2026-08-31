USE [ENACAL_Project];
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF OBJECT_ID('dbo.Auth_Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_Users (
        User_ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Email NVARCHAR(255) NOT NULL,
        Password_Hash NVARCHAR(256) NOT NULL,
        Password_Salt NVARCHAR(128) NOT NULL,
        [Role] NVARCHAR(20) NOT NULL,
        Display_Name NVARCHAR(200) NOT NULL,
        Client_ID INT NULL,
        Leader_Crew_ID INT NULL,
        Is_Active BIT NOT NULL CONSTRAINT DF_AuthUsers_IsActive DEFAULT (1),
        Created_At DATETIME2(0) NOT NULL CONSTRAINT DF_AuthUsers_CreatedAt DEFAULT (SYSUTCDATETIME()),
        Updated_At DATETIME2(0) NOT NULL CONSTRAINT DF_AuthUsers_UpdatedAt DEFAULT (SYSUTCDATETIME())
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE [type] = 'UQ'
      AND [name] = 'UQ_Auth_Users_Email'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT UQ_Auth_Users_Email UNIQUE (Email);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = 'FK_Auth_Users_Clients'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT FK_Auth_Users_Clients
        FOREIGN KEY (Client_ID) REFERENCES dbo.Clients (Client_ID);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = 'FK_Auth_Users_Leader_Crews'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT FK_Auth_Users_Leader_Crews
        FOREIGN KEY (Leader_Crew_ID) REFERENCES dbo.Leader_Crews (Leader_Crew_ID);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = 'CK_Auth_Users_Role'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT CK_Auth_Users_Role
        CHECK ([Role] IN ('cliente', 'trabajador'));
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = 'CK_Auth_Users_Relationship'
)
BEGIN
    ALTER TABLE dbo.Auth_Users
    ADD CONSTRAINT CK_Auth_Users_Relationship
        CHECK (
            ([Role] = 'cliente' AND Client_ID IS NOT NULL AND Leader_Crew_ID IS NULL)
            OR
            ([Role] = 'trabajador' AND Leader_Crew_ID IS NOT NULL AND Client_ID IS NULL)
        );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = 'UX_Auth_Users_Client_ID'
      AND object_id = OBJECT_ID('dbo.Auth_Users')
)
BEGIN
    CREATE UNIQUE INDEX UX_Auth_Users_Client_ID
        ON dbo.Auth_Users (Client_ID)
        WHERE Client_ID IS NOT NULL;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = 'UX_Auth_Users_Leader_Crew_ID'
      AND object_id = OBJECT_ID('dbo.Auth_Users')
)
BEGIN
    CREATE UNIQUE INDEX UX_Auth_Users_Leader_Crew_ID
        ON dbo.Auth_Users (Leader_Crew_ID)
        WHERE Leader_Crew_ID IS NOT NULL;
END;

IF OBJECT_ID('dbo.TR_Auth_Users_SetUpdatedAt', 'TR') IS NULL
BEGIN
    EXEC('CREATE TRIGGER dbo.TR_Auth_Users_SetUpdatedAt ON dbo.Auth_Users AFTER UPDATE AS BEGIN SET NOCOUNT ON; UPDATE u SET Updated_At = SYSUTCDATETIME() FROM dbo.Auth_Users u INNER JOIN inserted i ON i.User_ID = u.User_ID; END');
END;

COMMIT TRANSACTION;
GO

/*
Relaciones funcionales con el resto del modelo:
- Auth_Users.Client_ID -> Clients.Client_ID
  (un cliente autenticado se enlaza con Clients_Reports y Reports vía tabla Clients).
- Auth_Users.Leader_Crew_ID -> Leader_Crews.Leader_Crew_ID
  (un trabajador autenticado se enlaza con Assigments por Leader_Crews).
*/
