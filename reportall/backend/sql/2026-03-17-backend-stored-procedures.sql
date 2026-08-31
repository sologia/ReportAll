USE [ENACAL_Project];
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;
GO

-- Limpieza de SP obsoletos/legacy no usados por el backend actualizado
IF OBJECT_ID('dbo.Create_Paths', 'P') IS NOT NULL
    DROP PROCEDURE dbo.Create_Paths;
GO

/* ==========================
   Catálogos / listas simples
   ========================== */
CREATE OR ALTER PROCEDURE dbo.sp_Availability_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Availability_Crew
    FROM dbo.Cat_Availabilitys_Crews
    ORDER BY Availability_Crew ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Problem_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Name_Problem
    FROM dbo.Cat_Problems
    ORDER BY Name_Problem ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Sector_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Name_Sector
    FROM dbo.Cat_Sectors
    ORDER BY Name_Sector ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Leader_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Name_Leader
    FROM dbo.Leader_Crews
    ORDER BY Name_Leader ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_State_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT StateAs
    FROM dbo.Cat_States
    ORDER BY StateAs ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Vehicle_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Vehicle_ID, Plate
    FROM dbo.Cat_Vehicles
    ORDER BY Plate ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Vehicle_Create
    @Plate NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NormalizedPlate NVARCHAR(20) = UPPER(LTRIM(RTRIM(@Plate)));

    IF @NormalizedPlate IS NULL OR @NormalizedPlate = ''
    BEGIN
        THROW 50002, 'La matrícula es requerida', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.Cat_Vehicles
        WHERE UPPER(LTRIM(RTRIM(Plate))) = @NormalizedPlate
    )
    BEGIN
        THROW 50003, 'La matrícula ya está registrada', 1;
    END;

    DECLARE @NextNumVehicle INT;

    SELECT @NextNumVehicle = ISNULL(MAX(Num_Vehicle), 0) + 1
    FROM dbo.Cat_Vehicles WITH (UPDLOCK, HOLDLOCK);

    INSERT INTO dbo.Cat_Vehicles (Num_Vehicle, Plate)
    OUTPUT INSERTED.Vehicle_ID, INSERTED.Num_Vehicle, INSERTED.Plate
    VALUES (@NextNumVehicle, @NormalizedPlate);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Vehicle_Update
    @Vehicle_ID INT,
    @Plate NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NormalizedPlate NVARCHAR(20) = UPPER(LTRIM(RTRIM(@Plate)));

    IF @Vehicle_ID IS NULL OR @Vehicle_ID <= 0
    BEGIN
        THROW 50004, 'El ID de vehículo no es válido', 1;
    END;

    IF @NormalizedPlate IS NULL OR @NormalizedPlate = ''
    BEGIN
        THROW 50002, 'La matrícula es requerida', 1;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Cat_Vehicles
        WHERE Vehicle_ID = @Vehicle_ID
    )
    BEGIN
        THROW 50005, 'La matrícula no existe', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.Cat_Vehicles
        WHERE UPPER(LTRIM(RTRIM(Plate))) = @NormalizedPlate
          AND Vehicle_ID <> @Vehicle_ID
    )
    BEGIN
        THROW 50003, 'La matrícula ya está registrada', 1;
    END;

    UPDATE dbo.Cat_Vehicles
    SET Plate = @NormalizedPlate
    OUTPUT INSERTED.Vehicle_ID, INSERTED.Num_Vehicle, INSERTED.Plate
    WHERE Vehicle_ID = @Vehicle_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CrewsOnly_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Crew_ID,
        c.Num_Crew,
        cs.Name_Sector AS District,
        COALESCE(au.Display_Name, CONCAT('Cuadrilla ', c.Num_Crew)) AS Crew_Label,
        au.Display_Name AS Representative_Name
    FROM dbo.Crews c
    LEFT JOIN dbo.Cat_Sectors cs ON cs.Sector_ID = c.Sector_ID
    LEFT JOIN dbo.Auth_Users au ON au.Crew_ID = c.Crew_ID AND au.[Role] = 'cuadrilla' AND au.Is_Active = 1
    ORDER BY c.Num_Crew ASC;
END;
GO

/* ========
   Clientes
   ======== */
CREATE OR ALTER PROCEDURE dbo.sp_Client_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        FirstName_Client AS FirstName,
        SecondName_Client AS SecondName,
        FirstLastName_Client AS FirstLastName,
        SecondLastName_Client AS SecondLastName,
        Numero_NIC
    FROM dbo.Clients
    ORDER BY Client_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Client_GetById
    @Client_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        FirstName_Client,
        SecondName_Client,
        FirstLastName_Client,
        SecondLastName_Client,
        Numero_NIC
    FROM dbo.Clients
    WHERE Client_ID = @Client_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Client_Create
    @FirstName NVARCHAR(100),
    @SecondName NVARCHAR(100) = NULL,
    @FirstLastName NVARCHAR(100),
    @SecondLastName NVARCHAR(100) = NULL,
    @Numero_NIC NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Clients (FirstName_Client, SecondName_Client, FirstLastName_Client, SecondLastName_Client, Numero_NIC)
    OUTPUT INSERTED.Client_ID, INSERTED.FirstName_Client, INSERTED.SecondName_Client, INSERTED.FirstLastName_Client, INSERTED.SecondLastName_Client, INSERTED.Numero_NIC
    VALUES (@FirstName, @SecondName, @FirstLastName, @SecondLastName, @Numero_NIC);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Client_Update
    @Client_ID INT,
    @FirstName NVARCHAR(100) = NULL,
    @SecondName NVARCHAR(100) = NULL,
    @FirstLastName NVARCHAR(100) = NULL,
    @SecondLastName NVARCHAR(100) = NULL,
    @Numero_NIC NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Clients
    SET
        FirstName_Client = COALESCE(@FirstName, FirstName_Client),
        SecondName_Client = COALESCE(@SecondName, SecondName_Client),
        FirstLastName_Client = COALESCE(@FirstLastName, FirstLastName_Client),
        SecondLastName_Client = COALESCE(@SecondLastName, SecondLastName_Client),
        Numero_NIC = COALESCE(@Numero_NIC, Numero_NIC)
    WHERE Client_ID = @Client_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Client_Delete
    @Client_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Clients
    WHERE Client_ID = @Client_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

/* =====
   Paths
   ===== */
CREATE OR ALTER PROCEDURE dbo.sp_Path_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.Name_Path, d.Date_time
    FROM dbo.Paths p
    INNER JOIN dbo.Dates d ON p.Date_ID = d.Date_ID
    ORDER BY p.Path_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Path_GetById
    @Path_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Path_ID,
        Name_Path,
        Date_ID,
        CASE WHEN GeoM_Paths IS NULL THEN NULL ELSE GeoM_Paths.STAsText() END AS GeoM_Paths
    FROM dbo.Paths
    WHERE Path_ID = @Path_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Path_Create
    @Sectors VARCHAR(250),
    @Fecha DATETIME,
    @NamePath VARCHAR(250),
    @FechaCreada DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Sector_ID INT;
    DECLARE @Date_ID INT;

    SELECT TOP 1 @Sector_ID = s.Sector_ID
    FROM dbo.Cat_Sectors s
    WHERE s.Name_Sector = @Sectors;

    SELECT TOP 1 @Date_ID = d.Date_ID
    FROM dbo.Dates d
    WHERE d.Date_time = @Fecha;

    IF @Date_ID IS NULL
    BEGIN
        INSERT INTO dbo.Dates (Date_time)
        VALUES (@FechaCreada);

        SET @Date_ID = SCOPE_IDENTITY();
    END

    INSERT INTO dbo.Paths (Name_Path, Date_ID)
    VALUES (@NamePath, @Date_ID);

    SELECT SCOPE_IDENTITY() AS Path_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Path_Update
    @Path_ID INT,
    @Name_Path VARCHAR(250) = NULL,
    @Date_ID INT = NULL,
    @GeoM_Paths NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Paths
    SET
        Name_Path = COALESCE(@Name_Path, Name_Path),
        Date_ID = COALESCE(@Date_ID, Date_ID),
        GeoM_Paths = CASE
            WHEN @GeoM_Paths IS NULL THEN GeoM_Paths
            WHEN LEN(@GeoM_Paths) = 0 THEN NULL
            ELSE geometry::STGeomFromText(@GeoM_Paths, 4326)
        END
    WHERE Path_ID = @Path_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Path_Delete
    @Path_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Paths
    WHERE Path_ID = @Path_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

/* =====
   Crews
   ===== */
CREATE OR ALTER PROCEDURE dbo.sp_Crew_GetReportsSummary
    @District NVARCHAR(200) = NULL,
    @Order NVARCHAR(4) = N'desc',
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Crew_ID,
        c.Num_Crew,
        cs.Name_Sector AS District,
        COUNT(a.Report_ID) AS Reports_Attended
    FROM dbo.Crews c
    LEFT JOIN dbo.Cat_Sectors cs ON c.Sector_ID = cs.Sector_ID
    LEFT JOIN dbo.Assigments a ON a.Crew_ID = c.Crew_ID AND a.Report_ID IS NOT NULL
    LEFT JOIN dbo.Dates da ON da.Date_ID = a.Date_ID
    WHERE (@District IS NULL OR cs.Name_Sector = @District)
      AND (@DateFrom IS NULL OR CAST(da.Date_time AS date) >= @DateFrom)
      AND (@DateTo IS NULL OR CAST(da.Date_time AS date) <= @DateTo)
    GROUP BY c.Crew_ID, c.Num_Crew, cs.Name_Sector
    ORDER BY
      CASE WHEN LOWER(@Order) = 'asc' THEN COUNT(a.Report_ID) END ASC,
      CASE WHEN LOWER(@Order) <> 'asc' THEN COUNT(a.Report_ID) END DESC,
      c.Num_Crew ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Crew_GetReportsByCrew
    @Crew_ID INT,
    @Problem NVARCHAR(250) = NULL,
    @State NVARCHAR(250) = NULL,
    @Date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.Assigment_ID,
        r.Report_ID,
        p.Name_Problem,
        cpr.Urgency,
        r.Adress,
        cs.Name_Sector AS District,
        ds.Date_time AS Assignment_Date,
        st.StateAs AS State
    FROM dbo.Assigments a
    INNER JOIN dbo.Reports r ON r.Report_ID = a.Report_ID
    LEFT JOIN dbo.Cat_Problems p ON p.Problem_ID = r.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON cpr.ProblemLevel_ID = r.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors cs ON cs.Sector_ID = r.Sector_ID
    LEFT JOIN dbo.Dates ds ON ds.Date_ID = a.Date_ID
    LEFT JOIN dbo.Cat_States st ON st.State_ID = a.State_ID
    WHERE a.Crew_ID = @Crew_ID
      AND (@Problem IS NULL OR p.Name_Problem = @Problem)
      AND (@State IS NULL OR st.StateAs = @State)
      AND (@Date IS NULL OR CAST(ds.Date_time AS date) = @Date)
    ORDER BY a.Assigment_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Crew_Update
    @Crew_ID INT,
    @Availability NVARCHAR(250) = NULL,
    @Sector NVARCHAR(250) = NULL,
    @Plate NVARCHAR(20) = NULL,
    @Num_Crew INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Crews
    SET
        Num_Crew = COALESCE(@Num_Crew, Num_Crew),
        Availability_Crew_ID = COALESCE((SELECT TOP 1 Availability_Crew_ID FROM dbo.Cat_Availabilitys_Crews WHERE Availability_Crew = @Availability), Availability_Crew_ID),
        Sector_ID = COALESCE((SELECT TOP 1 Sector_ID FROM dbo.Cat_Sectors WHERE Name_Sector = @Sector), Sector_ID),
        Vehicle_ID = COALESCE((SELECT TOP 1 Vehicle_ID FROM dbo.Cat_Vehicles WHERE Plate = @Plate), Vehicle_ID)
    WHERE Crew_ID = @Crew_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Crew_Delete
    @Crew_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Crews WHERE Crew_ID = @Crew_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

/* ===========
   Asignaciones
   =========== */
CREATE OR ALTER PROCEDURE dbo.sp_Assignment_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.Assigment_ID,
        lc.Name_Leader,
        c.Num_Crew,
        a.Report_ID,
        r.Adress AS Report_Adress,
        CONVERT(date, d.Date_time) AS Dates,
        cs.StateAs
    FROM dbo.Assigments a
    INNER JOIN dbo.Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
    INNER JOIN dbo.Crews c ON a.Crew_ID = c.Crew_ID
    LEFT JOIN dbo.Reports r ON a.Report_ID = r.Report_ID
    INNER JOIN dbo.Dates d ON a.Date_ID = d.Date_ID
    INNER JOIN dbo.Cat_States cs ON a.State_ID = cs.State_ID
    ORDER BY a.Assigment_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_GetById
    @Assigment_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.Assigment_ID,
        lc.Name_Leader,
        c.Num_Crew,
        a.Report_ID,
        r.Adress AS Report_Adress,
        d.Date_time,
        cs.StateAs
    FROM dbo.Assigments a
    INNER JOIN dbo.Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
    INNER JOIN dbo.Crews c ON a.Crew_ID = c.Crew_ID
    LEFT JOIN dbo.Reports r ON a.Report_ID = r.Report_ID
    INNER JOIN dbo.Dates d ON a.Date_ID = d.Date_ID
    INNER JOIN dbo.Cat_States cs ON a.State_ID = cs.State_ID
    WHERE a.Assigment_ID = @Assigment_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_ValidateDistrict
    @Num_Crew INT,
    @Report_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        crewSector.Name_Sector AS Crew_District,
        reportSector.Name_Sector AS Report_District
    FROM (SELECT TOP 1 Crew_ID, Sector_ID FROM dbo.Crews WHERE Num_Crew = @Num_Crew) c
    LEFT JOIN dbo.Cat_Sectors crewSector ON crewSector.Sector_ID = c.Sector_ID
    LEFT JOIN dbo.Reports r ON r.Report_ID = @Report_ID
    LEFT JOIN dbo.Cat_Sectors reportSector ON reportSector.Sector_ID = r.Sector_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_Create
    @Name_Leader NVARCHAR(250) = NULL,
    @Leader_Crew_ID INT = NULL,
    @Num_Crew INT,
    @Report_ID INT,
    @Date_Time DATETIME,
    @StateAs NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Date_ID INT;
    DECLARE @ResolvedLeaderCrewID INT;

    SELECT TOP 1 @Date_ID = Date_ID
    FROM dbo.Dates
    WHERE Date_time = @Date_Time;

    IF @Date_ID IS NULL
    BEGIN
        INSERT INTO dbo.Dates (Date_time) VALUES (@Date_Time);
        SET @Date_ID = SCOPE_IDENTITY();
    END;

    SET @ResolvedLeaderCrewID = COALESCE(
        @Leader_Crew_ID,
        (SELECT TOP 1 Leader_Crew_ID FROM dbo.Leader_Crews WHERE Name_Leader = @Name_Leader)
    );

    INSERT INTO dbo.Assigments (Leader_Crew_ID, Crew_ID, Report_ID, Date_ID, State_ID)
    VALUES (
        @ResolvedLeaderCrewID,
        (SELECT TOP 1 Crew_ID FROM dbo.Crews WHERE Num_Crew = @Num_Crew),
        @Report_ID,
        @Date_ID,
        (SELECT TOP 1 State_ID FROM dbo.Cat_States WHERE StateAs = @StateAs)
    );

    SELECT SCOPE_IDENTITY() AS Assigment_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_OwnershipCheck
    @Assigment_ID INT,
    @Crew_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 Assigment_ID
    FROM dbo.Assigments
    WHERE Assigment_ID = @Assigment_ID
      AND Crew_ID = @Crew_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_Update
    @Assigment_ID INT,
    @Name_Leader NVARCHAR(250) = NULL,
    @Num_Crew INT = NULL,
    @Report_ID INT = NULL,
    @Date_Time DATETIME = NULL,
    @StateAs NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewDate_ID INT = NULL;

    IF @Date_Time IS NOT NULL
    BEGIN
        INSERT INTO dbo.Dates (Date_time) VALUES (@Date_Time);
        SET @NewDate_ID = SCOPE_IDENTITY();
    END;

    UPDATE dbo.Assigments
    SET
        Leader_Crew_ID = COALESCE((SELECT TOP 1 Leader_Crew_ID FROM dbo.Leader_Crews WHERE Name_Leader = @Name_Leader), Leader_Crew_ID),
        Crew_ID = COALESCE((SELECT TOP 1 Crew_ID FROM dbo.Crews WHERE Num_Crew = @Num_Crew), Crew_ID),
        Report_ID = COALESCE(@Report_ID, Report_ID),
        Date_ID = COALESCE(@NewDate_ID, Date_ID),
        State_ID = COALESCE((SELECT TOP 1 State_ID FROM dbo.Cat_States WHERE StateAs = @StateAs), State_ID)
    WHERE Assigment_ID = @Assigment_ID;

    SELECT @@ROWCOUNT AS RowsAffected;

    SELECT
        a.Assigment_ID,
        lc.Name_Leader,
        c.Num_Crew,
        a.Report_ID,
        r.Adress AS Report_Adress,
        d.Date_time,
        cs.StateAs
    FROM dbo.Assigments a
    INNER JOIN dbo.Leader_Crews lc ON a.Leader_Crew_ID = lc.Leader_Crew_ID
    INNER JOIN dbo.Crews c ON a.Crew_ID = c.Crew_ID
    LEFT JOIN dbo.Reports r ON a.Report_ID = r.Report_ID
    INNER JOIN dbo.Dates d ON a.Date_ID = d.Date_ID
    INNER JOIN dbo.Cat_States cs ON a.State_ID = cs.State_ID
    WHERE a.Assigment_ID = @Assigment_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Assignment_Delete
    @Assigment_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Assigments
    WHERE Assigment_ID = @Assigment_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

/* ======
   Auth
   ====== */
CREATE OR ALTER PROCEDURE dbo.sp_Auth_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        u.User_ID,
        u.Email,
        u.Password_Hash,
        u.Password_Salt,
        u.[Role],
        u.Display_Name,
        u.Client_ID,
        u.Leader_Crew_ID,
        u.Crew_ID,
        u.Is_Active
    FROM dbo.Auth_Users u
    WHERE u.Email = @Email;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_EnsureClient
    @FirstName NVARCHAR(100),
    @SecondName NVARCHAR(100) = NULL,
    @FirstLastName NVARCHAR(100),
    @SecondLastName NVARCHAR(100) = NULL,
    @Numero_NIC NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Client_ID INT;

    SELECT TOP 1 @Client_ID = Client_ID
    FROM dbo.Clients
    WHERE Numero_NIC = @Numero_NIC
    ORDER BY Client_ID DESC;

    IF @Client_ID IS NULL
    BEGIN
        INSERT INTO dbo.Clients (FirstName_Client, SecondName_Client, FirstLastName_Client, SecondLastName_Client, Numero_NIC)
        VALUES (@FirstName, @SecondName, @FirstLastName, @SecondLastName, @Numero_NIC);

        SET @Client_ID = SCOPE_IDENTITY();
    END;

    SELECT @Client_ID AS Client_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_EnsureLeader
    @Name_Leader NVARCHAR(250)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Leader_Crew_ID INT;

    SELECT TOP 1 @Leader_Crew_ID = Leader_Crew_ID
    FROM dbo.Leader_Crews
    WHERE Name_Leader = @Name_Leader
    ORDER BY Leader_Crew_ID DESC;

    IF @Leader_Crew_ID IS NULL
    BEGIN
        INSERT INTO dbo.Leader_Crews (Name_Leader)
        VALUES (@Name_Leader);

        SET @Leader_Crew_ID = SCOPE_IDENTITY();
    END;

    SELECT @Leader_Crew_ID AS Leader_Crew_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_FindCrewByNumber
    @Num_Crew INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 Crew_ID
    FROM dbo.Crews
    WHERE Num_Crew = @Num_Crew
    ORDER BY Crew_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_CreateUser
    @Email NVARCHAR(255),
    @Password_Hash NVARCHAR(256),
    @Password_Salt NVARCHAR(128),
    @Role NVARCHAR(20),
    @Display_Name NVARCHAR(200),
    @Client_ID INT = NULL,
    @Leader_Crew_ID INT = NULL,
    @Crew_ID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Auth_Users (Email, Password_Hash, Password_Salt, [Role], Display_Name, Client_ID, Leader_Crew_ID, Crew_ID)
    OUTPUT INSERTED.User_ID, INSERTED.Email, INSERTED.[Role], INSERTED.Display_Name, INSERTED.Client_ID, INSERTED.Leader_Crew_ID, INSERTED.Crew_ID
    VALUES (@Email, @Password_Hash, @Password_Salt, @Role, @Display_Name, @Client_ID, @Leader_Crew_ID, @Crew_ID);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_GetCrewAccounts
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.User_ID,
        u.Email,
        u.Display_Name,
        u.Crew_ID,
        c.Num_Crew,
        u.Is_Active
    FROM dbo.Auth_Users u
    LEFT JOIN dbo.Crews c ON c.Crew_ID = u.Crew_ID
    WHERE u.[Role] = 'cuadrilla'
    ORDER BY c.Num_Crew ASC, u.Email ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Auth_UpdatePassword
    @User_ID INT,
    @Password_Hash NVARCHAR(256),
    @Password_Salt NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Auth_Users
    SET Password_Hash = @Password_Hash,
        Password_Salt = @Password_Salt
    WHERE User_ID = @User_ID
      AND [Role] = 'cuadrilla';

    SELECT
        User_ID,
        Email,
        Display_Name,
        Crew_ID,
        Is_Active
    FROM dbo.Auth_Users
    WHERE User_ID = @User_ID
      AND [Role] = 'cuadrilla';
END;
GO

/* ========
   Reportes
   ======== */
CREATE OR ALTER PROCEDURE dbo.sp_Report_GetOptions
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.Report_ID,
        r.Adress,
        p.Name_Problem,
        cpr.Urgency,
        cs.Name_Sector AS District
    FROM dbo.Reports r
    LEFT JOIN dbo.Cat_Problems p ON r.Problem_ID = p.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
    ORDER BY r.Report_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetUrgencies
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ProblemLevel_ID, Urgency
    FROM dbo.Cat_ProblemLevels
    ORDER BY ProblemLevel_ID ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetSummary
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @Date DATE = NULL,
    @State NVARCHAR(100) = NULL,
    @District NVARCHAR(200) = NULL,
    @Sector NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.Report_ID,
        p.Name_Problem,
        cpr.Urgency,
        r.Adress,
        cs.Name_Sector AS Sector,
        cs.Name_Sector AS District,
        CAST(d.Date_time AS date) AS Report_Date,
        ISNULL(st.StateAs, 'Sin estado') AS State
    FROM dbo.Reports r
    LEFT JOIN dbo.Cat_Problems p ON r.Problem_ID = p.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
    LEFT JOIN dbo.Clients_Reports cr ON cr.Report_ID = r.Report_ID
    LEFT JOIN dbo.Dates d ON d.Date_ID = cr.Date_ID
    OUTER APPLY (
        SELECT TOP 1 a.State_ID
        FROM dbo.Assigments a
        WHERE a.Report_ID = r.Report_ID
        ORDER BY a.Assigment_ID DESC
    ) la
    LEFT JOIN dbo.Cat_States st ON st.State_ID = la.State_ID
    WHERE (@DateFrom IS NULL OR CAST(d.Date_time AS date) >= @DateFrom)
      AND (@DateTo IS NULL OR CAST(d.Date_time AS date) <= @DateTo)
      AND (@Date IS NULL OR CAST(d.Date_time AS date) = @Date)
      AND (@State IS NULL OR ISNULL(st.StateAs, 'Sin estado') = @State)
      AND (@District IS NULL OR cs.Name_Sector = @District)
      AND (@Sector IS NULL OR cs.Name_Sector = @Sector)
    ORDER BY r.Report_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetSummaryMap
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @Date DATE = NULL,
    @State NVARCHAR(100) = NULL,
    @District NVARCHAR(200) = NULL,
    @Sector NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.Report_ID,
        p.Name_Problem,
        cpr.Urgency,
        r.Adress,
        cs.Name_Sector AS District,
        CAST(d.Date_time AS date) AS Report_Date,
        ISNULL(st.StateAs, 'Sin estado') AS State,
        TRY_CONVERT(float, r.X) AS X,
        TRY_CONVERT(float, r.Y) AS Y,
        c.Num_Crew,
        lc.Name_Leader
    FROM dbo.Reports r
    LEFT JOIN dbo.Cat_Problems p ON r.Problem_ID = p.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON r.ProblemLevel_ID = cpr.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors cs ON r.Sector_ID = cs.Sector_ID
    LEFT JOIN dbo.Clients_Reports cr ON cr.Report_ID = r.Report_ID
    LEFT JOIN dbo.Dates d ON d.Date_ID = cr.Date_ID
    OUTER APPLY (
        SELECT TOP 1 a.Assigment_ID, a.State_ID, a.Crew_ID, a.Leader_Crew_ID
        FROM dbo.Assigments a
        WHERE a.Report_ID = r.Report_ID
        ORDER BY a.Assigment_ID DESC
    ) la
    LEFT JOIN dbo.Cat_States st ON st.State_ID = la.State_ID
    LEFT JOIN dbo.Crews c ON c.Crew_ID = la.Crew_ID
    LEFT JOIN dbo.Leader_Crews lc ON lc.Leader_Crew_ID = la.Leader_Crew_ID
    WHERE TRY_CONVERT(float, r.X) IS NOT NULL
      AND TRY_CONVERT(float, r.Y) IS NOT NULL
      AND (@DateFrom IS NULL OR CAST(d.Date_time AS date) >= @DateFrom)
      AND (@DateTo IS NULL OR CAST(d.Date_time AS date) <= @DateTo)
      AND (@Date IS NULL OR CAST(d.Date_time AS date) = @Date)
      AND (@State IS NULL OR ISNULL(st.StateAs, 'Sin estado') = @State)
      AND (@District IS NULL OR cs.Name_Sector = @District)
      AND (@Sector IS NULL OR cs.Name_Sector = @Sector)
    ORDER BY r.Report_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetStatisticsReports
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @District NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH LatestAssignment AS (
        SELECT
            a.Report_ID,
            a.State_ID,
            ROW_NUMBER() OVER (PARTITION BY a.Report_ID ORDER BY a.Assigment_ID DESC) AS rn
        FROM dbo.Assigments a
        WHERE a.Report_ID IS NOT NULL
    )
    SELECT
        r.Report_ID,
        ISNULL(st.StateAs, 'Sin estado') AS State,
        ISNULL(cpl.Urgency, 'Sin urgencia') AS Urgency,
        ISNULL(rs.Name_Sector, 'Sin distrito') AS District,
        ISNULL(p.Name_Problem, 'Sin problema') AS Problem,
        CASE WHEN la.Report_ID IS NULL THEN 0 ELSE 1 END AS IsAssigned,
        CASE
            WHEN LOWER(ISNULL(st.StateAs, '')) LIKE '%terminad%'
                OR LOWER(ISNULL(st.StateAs, '')) LIKE '%resuelt%'
                OR LOWER(ISNULL(st.StateAs, '')) LIKE '%complet%'
            THEN 1
            ELSE 0
        END AS IsSolved
    FROM dbo.Reports r
    LEFT JOIN dbo.Cat_Problems p ON p.Problem_ID = r.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpl ON cpl.ProblemLevel_ID = r.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors rs ON rs.Sector_ID = r.Sector_ID
    LEFT JOIN dbo.Clients_Reports cr ON cr.Report_ID = r.Report_ID
    LEFT JOIN dbo.Dates d ON d.Date_ID = cr.Date_ID
    LEFT JOIN LatestAssignment la ON la.Report_ID = r.Report_ID AND la.rn = 1
    LEFT JOIN dbo.Cat_States st ON st.State_ID = la.State_ID
    WHERE (@DateFrom IS NULL OR CAST(d.Date_time AS date) >= @DateFrom)
      AND (@DateTo IS NULL OR CAST(d.Date_time AS date) <= @DateTo)
      AND (@District IS NULL OR rs.Name_Sector = @District);
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetStatisticsCrews
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @District NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH LatestCrewAssignment AS (
        SELECT
            a.Crew_ID,
            a.Report_ID,
            a.State_ID,
            ROW_NUMBER() OVER (
                PARTITION BY a.Crew_ID, a.Report_ID
                ORDER BY a.Assigment_ID DESC
            ) AS rn
        FROM dbo.Assigments a
        LEFT JOIN dbo.Dates da ON da.Date_ID = a.Date_ID
        LEFT JOIN dbo.Reports r ON r.Report_ID = a.Report_ID
        LEFT JOIN dbo.Cat_Sectors s ON s.Sector_ID = r.Sector_ID
        WHERE a.Report_ID IS NOT NULL
          AND (@DateFrom IS NULL OR CAST(da.Date_time AS date) >= @DateFrom)
          AND (@DateTo IS NULL OR CAST(da.Date_time AS date) <= @DateTo)
          AND (@District IS NULL OR s.Name_Sector = @District)
    )
    SELECT
        c.Crew_ID,
        c.Num_Crew,
        ISNULL(cs.Name_Sector, 'Sin distrito') AS District,
        COUNT(lca.Report_ID) AS Assigned_Total,
        SUM(
            CASE
                WHEN LOWER(ISNULL(st.StateAs, '')) LIKE '%terminad%'
                    OR LOWER(ISNULL(st.StateAs, '')) LIKE '%resuelt%'
                    OR LOWER(ISNULL(st.StateAs, '')) LIKE '%complet%'
                THEN 1
                ELSE 0
            END
        ) AS Solved_Total
    FROM dbo.Crews c
    LEFT JOIN dbo.Cat_Sectors cs ON cs.Sector_ID = c.Sector_ID
    LEFT JOIN LatestCrewAssignment lca ON lca.Crew_ID = c.Crew_ID AND lca.rn = 1
    LEFT JOIN dbo.Cat_States st ON st.State_ID = lca.State_ID
    GROUP BY c.Crew_ID, c.Num_Crew, cs.Name_Sector
    ORDER BY COUNT(lca.Report_ID) DESC, c.Num_Crew ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_GetByClient
    @Client_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.Report_ID,
        p.Name_Problem,
        cpr.Urgency,
        r.Adress,
        cs.Name_Sector AS District,
        CAST(d.Date_time AS date) AS Report_Date,
        ISNULL(st.StateAs, 'Sin estado') AS State
    FROM dbo.Clients_Reports cr
    INNER JOIN dbo.Reports r ON r.Report_ID = cr.Report_ID
    LEFT JOIN dbo.Cat_Problems p ON p.Problem_ID = r.Problem_ID
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON cpr.ProblemLevel_ID = r.ProblemLevel_ID
    LEFT JOIN dbo.Cat_Sectors cs ON cs.Sector_ID = r.Sector_ID
    LEFT JOIN dbo.Dates d ON d.Date_ID = cr.Date_ID
    OUTER APPLY (
        SELECT TOP 1 a.State_ID
        FROM dbo.Assigments a
        WHERE a.Report_ID = r.Report_ID
        ORDER BY a.Assigment_ID DESC
    ) la
    LEFT JOIN dbo.Cat_States st ON st.State_ID = la.State_ID
    WHERE cr.Client_ID = @Client_ID
    ORDER BY cr.Client_Report_ID DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_Update
    @Report_ID INT,
    @Name_Problem NVARCHAR(100) = NULL,
    @Urgency NVARCHAR(200) = NULL,
    @Adress NVARCHAR(200) = NULL,
    @Name_Sector NVARCHAR(200) = NULL,
    @Date_Time DATETIME = NULL,
    @BINPhoto VARBINARY(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IDPhoto INT = NULL;

    IF @BINPhoto IS NOT NULL
    BEGIN
        INSERT INTO dbo.Cat_Photos (BINPhoto) VALUES (@BINPhoto);
        SET @IDPhoto = SCOPE_IDENTITY();
    END;

    UPDATE dbo.Reports
    SET
        Problem_ID = COALESCE((SELECT TOP 1 Problem_ID FROM dbo.Cat_Problems WHERE Name_Problem = @Name_Problem), Problem_ID),
        ProblemLevel_ID = COALESCE((SELECT TOP 1 ProblemLevel_ID FROM dbo.Cat_ProblemLevels WHERE Urgency = @Urgency), ProblemLevel_ID),
        Adress = COALESCE(@Adress, Adress),
        Sector_ID = COALESCE((SELECT TOP 1 Sector_ID FROM dbo.Cat_Sectors WHERE Name_Sector = @Name_Sector), Sector_ID),
        Photo_ID = COALESCE(@IDPhoto, Photo_ID)
    WHERE Report_ID = @Report_ID;

    DECLARE @Rows INT = @@ROWCOUNT;

    IF @Date_Time IS NOT NULL
    BEGIN
        UPDATE dbo.Clients_Reports
        SET Date_ID = (
            SELECT TOP 1 Date_ID FROM dbo.Dates WHERE Date_time = @Date_Time
        )
        WHERE Report_ID = @Report_ID;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO dbo.Dates (Date_time) VALUES (@Date_Time);

            UPDATE dbo.Clients_Reports
            SET Date_ID = SCOPE_IDENTITY()
            WHERE Report_ID = @Report_ID;
        END;
    END;

    SELECT @Rows AS RowsAffected;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_UpdateUrgency
    @Report_ID INT,
    @Urgency NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProblemLevel_ID INT;

    SELECT TOP 1 @ProblemLevel_ID = ProblemLevel_ID
    FROM dbo.Cat_ProblemLevels
    WHERE Urgency = @Urgency;

    IF @ProblemLevel_ID IS NULL
    BEGIN
        SELECT CAST(0 AS BIT) AS Ok, CAST(NULL AS INT) AS Report_ID, CAST(NULL AS NVARCHAR(200)) AS Urgency;
        RETURN;
    END;

    UPDATE dbo.Reports
    SET ProblemLevel_ID = @ProblemLevel_ID
    WHERE Report_ID = @Report_ID;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT CAST(0 AS BIT) AS Ok, CAST(NULL AS INT) AS Report_ID, CAST(NULL AS NVARCHAR(200)) AS Urgency;
        RETURN;
    END;

    SELECT CAST(1 AS BIT) AS Ok, r.Report_ID, cpr.Urgency
    FROM dbo.Reports r
    LEFT JOIN dbo.Cat_ProblemLevels cpr ON cpr.ProblemLevel_ID = r.ProblemLevel_ID
    WHERE r.Report_ID = @Report_ID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Report_Delete
    @Report_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Reports
    WHERE Report_ID = @Report_ID;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

COMMIT TRANSACTION;
GO
