USE [ENACAL_Project];
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

DECLARE @AdminEmail NVARCHAR(255) = 'csolorzano@enacal.local';
DECLARE @DirectorEmail NVARCHAR(255) = 'gyasi@enacal.local';
DECLARE @CrewEmail NVARCHAR(255) = 'palejandro@enacal.local';

DECLARE @CrewIdForPAlejandro INT;

SELECT TOP 1 @CrewIdForPAlejandro = c.Crew_ID
FROM dbo.Crews c
LEFT JOIN dbo.Auth_Users u
    ON u.Crew_ID = c.Crew_ID
   AND LOWER(u.Email) <> LOWER(@CrewEmail)
ORDER BY CASE WHEN u.User_ID IS NULL THEN 0 ELSE 1 END, c.Crew_ID;

IF @CrewIdForPAlejandro IS NULL
BEGIN
    THROW 50001, 'No existe ninguna cuadrilla disponible en dbo.Crews para asignar la cuenta PAlejandro.', 1;
END;

-- 1) Administrador: CSolorzano / Carlos1
IF EXISTS (SELECT 1 FROM dbo.Auth_Users WHERE LOWER(Email) = LOWER(@AdminEmail))
BEGIN
    UPDATE dbo.Auth_Users
    SET
        Password_Hash = '3d0d718006b9348818a8acdf83688d534979c1e6e47e123f5c502a0a9a0509f20384e703c3088dbccc8ffbcb1ffa9061a5dd830b09c453e1b2dafe078a02b58c',
        Password_Salt = 'a25b5fdbd289587aa2bb4066abbc287b',
        [Role] = 'administrador',
        Display_Name = 'CSolorzano',
        Client_ID = NULL,
        Leader_Crew_ID = NULL,
        Crew_ID = NULL,
        Is_Active = 1
    WHERE LOWER(Email) = LOWER(@AdminEmail);
END
ELSE
BEGIN
    INSERT INTO dbo.Auth_Users
    (
        Email,
        Password_Hash,
        Password_Salt,
        [Role],
        Display_Name,
        Client_ID,
        Leader_Crew_ID,
        Crew_ID,
        Is_Active
    )
    VALUES
    (
        @AdminEmail,
        '3d0d718006b9348818a8acdf83688d534979c1e6e47e123f5c502a0a9a0509f20384e703c3088dbccc8ffbcb1ffa9061a5dd830b09c453e1b2dafe078a02b58c',
        'a25b5fdbd289587aa2bb4066abbc287b',
        'administrador',
        'CSolorzano',
        NULL,
        NULL,
        NULL,
        1
    );
END;

-- 2) Director IT: GYasi / Yasi123
IF EXISTS (SELECT 1 FROM dbo.Auth_Users WHERE LOWER(Email) = LOWER(@DirectorEmail))
BEGIN
    UPDATE dbo.Auth_Users
    SET
        Password_Hash = 'cc0e3df6d79309c1eb42aacbf504d814b3b632105c4a7ab6afb026761aaad666d3d280770bea84b16b70661b8c564e9c795f9cb6889a224c12670640d059dae6',
        Password_Salt = 'eb3730e85363b83629dc214cd4f2cacd',
        [Role] = 'director_it',
        Display_Name = 'GYasi',
        Client_ID = NULL,
        Leader_Crew_ID = NULL,
        Crew_ID = NULL,
        Is_Active = 1
    WHERE LOWER(Email) = LOWER(@DirectorEmail);
END
ELSE
BEGIN
    INSERT INTO dbo.Auth_Users
    (
        Email,
        Password_Hash,
        Password_Salt,
        [Role],
        Display_Name,
        Client_ID,
        Leader_Crew_ID,
        Crew_ID,
        Is_Active
    )
    VALUES
    (
        @DirectorEmail,
        'cc0e3df6d79309c1eb42aacbf504d814b3b632105c4a7ab6afb026761aaad666d3d280770bea84b16b70661b8c564e9c795f9cb6889a224c12670640d059dae6',
        'eb3730e85363b83629dc214cd4f2cacd',
        'director_it',
        'GYasi',
        NULL,
        NULL,
        NULL,
        1
    );
END;

-- 3) Cuadrilla: PAlejandro / Alejandro1
IF EXISTS (SELECT 1 FROM dbo.Auth_Users WHERE LOWER(Email) = LOWER(@CrewEmail))
BEGIN
    UPDATE dbo.Auth_Users
    SET
        Password_Hash = '943fccf42b1f0394b67737c261a1c0ebecf16d742c66f7c1c02c5b40a7c5c4b02d68608db9c16a39ee125edb7e37ae9b3cd83e4ec406fd9c35d1a89d6e2ace51',
        Password_Salt = '451ad886a18b072b1172157be0e7483b',
        [Role] = 'cuadrilla',
        Display_Name = 'PAlejandro',
        Client_ID = NULL,
        Leader_Crew_ID = NULL,
        Crew_ID = @CrewIdForPAlejandro,
        Is_Active = 1
    WHERE LOWER(Email) = LOWER(@CrewEmail);
END
ELSE
BEGIN
    INSERT INTO dbo.Auth_Users
    (
        Email,
        Password_Hash,
        Password_Salt,
        [Role],
        Display_Name,
        Client_ID,
        Leader_Crew_ID,
        Crew_ID,
        Is_Active
    )
    VALUES
    (
        @CrewEmail,
        '943fccf42b1f0394b67737c261a1c0ebecf16d742c66f7c1c02c5b40a7c5c4b02d68608db9c16a39ee125edb7e37ae9b3cd83e4ec406fd9c35d1a89d6e2ace51',
        '451ad886a18b072b1172157be0e7483b',
        'cuadrilla',
        'PAlejandro',
        NULL,
        NULL,
        @CrewIdForPAlejandro,
        1
    );
END;

COMMIT TRANSACTION;
GO

SELECT User_ID, Email, Display_Name, [Role], Client_ID, Leader_Crew_ID, Crew_ID, Is_Active
FROM dbo.Auth_Users
WHERE LOWER(Email) IN ('csolorzano@enacal.local', 'gyasi@enacal.local', 'palejandro@enacal.local')
ORDER BY User_ID;
GO
