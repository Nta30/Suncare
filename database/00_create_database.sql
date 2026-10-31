-- Optional. Run with an account allowed to create databases; does not overwrite data.
USE [master];
GO
IF DB_ID(N'Suncare') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [Suncare] COLLATE Latin1_General_100_CI_AS_SC;');
END;
GO
-- Open a new query connected to Suncare before running 01_schema.sql.
