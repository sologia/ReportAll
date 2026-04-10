USE [ENACAL_Project];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/*
  Seed de 50 reportes con puntos geograficos distintos.
  Usa el SP del sistema para respetar reglas de negocio y FK.

  Nota:
  - X se usa como longitud
  - Y se usa como latitud
*/

DECLARE @TotalToInsert INT = 50;
DECLARE @i INT = 1;

DECLARE @BaseLat FLOAT = 12.114992;   -- Managua aprox
DECLARE @BaseLng FLOAT = -86.236174;  -- Managua aprox

DECLARE @BeforeCount INT;
DECLARE @AfterCount INT;

SELECT @BeforeCount = COUNT(*)
FROM dbo.Reports;

IF NOT EXISTS (SELECT 1 FROM dbo.Cat_Problems)
    THROW 50001, 'No hay datos en Cat_Problems. No se puede insertar reportes.', 1;

IF NOT EXISTS (SELECT 1 FROM dbo.Cat_Sectors)
    THROW 50002, 'No hay datos en Cat_Sectors. No se puede insertar reportes.', 1;

IF NOT EXISTS (SELECT 1 FROM dbo.Clients)
    THROW 50003, 'No hay datos en Clients. No se puede insertar reportes.', 1;

DECLARE @Problems TABLE (
    RowNum INT IDENTITY(1,1) PRIMARY KEY,
    Name_Problem NVARCHAR(100)
);

DECLARE @Sectors TABLE (
    RowNum INT IDENTITY(1,1) PRIMARY KEY,
    Name_Sector NVARCHAR(200)
);

DECLARE @Clients TABLE (
    RowNum INT IDENTITY(1,1) PRIMARY KEY,
    Client_ID INT
);

INSERT INTO @Problems (Name_Problem)
SELECT Name_Problem
FROM dbo.Cat_Problems
ORDER BY Name_Problem;

INSERT INTO @Sectors (Name_Sector)
SELECT Name_Sector
FROM dbo.Cat_Sectors
ORDER BY Name_Sector;

INSERT INTO @Clients (Client_ID)
SELECT Client_ID
FROM dbo.Clients
ORDER BY Client_ID;

DECLARE @ProblemCount INT = (SELECT COUNT(*) FROM @Problems);
DECLARE @SectorCount INT = (SELECT COUNT(*) FROM @Sectors);
DECLARE @ClientCount INT = (SELECT COUNT(*) FROM @Clients);

WHILE @i <= @TotalToInsert
BEGIN
    DECLARE @ProblemIdx INT = ((@i - 1) % @ProblemCount) + 1;
    DECLARE @SectorIdx INT = ((@i - 1) % @SectorCount) + 1;
    DECLARE @ClientIdx INT = ((@i - 1) % @ClientCount) + 1;

    DECLARE @Name_Problem NVARCHAR(100);
    DECLARE @Name_Sector NVARCHAR(200);
    DECLARE @ClientID INT;

    SELECT @Name_Problem = Name_Problem FROM @Problems WHERE RowNum = @ProblemIdx;
    SELECT @Name_Sector = Name_Sector FROM @Sectors WHERE RowNum = @SectorIdx;
    SELECT @ClientID = Client_ID FROM @Clients WHERE RowNum = @ClientIdx;

    DECLARE @Urgency NVARCHAR(200) =
        CASE
            WHEN @i % 3 = 1 THEN N'Alto'
            WHEN @i % 3 = 2 THEN N'Medio'
            ELSE N'Bajo'
        END;

    -- Dispersa puntos en una malla 10x5 con pequena variacion aleatoria.
    DECLARE @row INT = (@i - 1) / 10;
    DECLARE @col INT = (@i - 1) % 10;

    DECLARE @lat FLOAT = @BaseLat + (@row * 0.0040) + ((ABS(CHECKSUM(NEWID())) % 100) / 100000.0);
    DECLARE @lng FLOAT = @BaseLng + (@col * 0.0035) + ((ABS(CHECKSUM(NEWID())) % 100) / 100000.0);

    DECLARE @Adress NVARCHAR(200) =
        CONCAT(N'Punto prueba #', @i, N' - Sector ', @Name_Sector, N' (', FORMAT(@lat, '0.000000'), N', ', FORMAT(@lng, '0.000000'), N')');

    DECLARE @Date_Time DATETIME = DATEADD(MINUTE, -(@i * 7), GETDATE());

    EXEC dbo.sp_InsertReport
        @Name_Problem = @Name_Problem,
        @Urgency = @Urgency,
        @X = @lng,
        @Y = @lat,
        @BINPhoto = NULL,
        @Adress = @Adress,
        @Name_Sector = @Name_Sector,
        @Date_Time = @Date_Time,
        @ClientID = @ClientID;

    SET @i += 1;
END;

SELECT @AfterCount = COUNT(*)
FROM dbo.Reports;

SELECT
    @BeforeCount AS Reports_Before,
    @AfterCount AS Reports_After,
    (@AfterCount - @BeforeCount) AS Inserted_Reports;
GO
