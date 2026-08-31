-- Backfill Num_Vehicle for existing rows with NULL
-- and ensure future inserts assign Num_Vehicle sequentially.

SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    ;WITH Seed AS (
        SELECT ISNULL(MAX(Num_Vehicle), 0) AS MaxNumVehicle
        FROM dbo.Cat_Vehicles
        WHERE Num_Vehicle IS NOT NULL
    ), Missing AS (
        SELECT
            v.Vehicle_ID,
            ROW_NUMBER() OVER (ORDER BY v.Vehicle_ID ASC) AS rn
        FROM dbo.Cat_Vehicles v
        WHERE v.Num_Vehicle IS NULL
    )
    UPDATE v
    SET v.Num_Vehicle = s.MaxNumVehicle + m.rn
    FROM dbo.Cat_Vehicles v
    INNER JOIN Missing m ON m.Vehicle_ID = v.Vehicle_ID
    CROSS JOIN Seed s;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

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
