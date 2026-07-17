---------------------------------------------------------------------
-- EnterpriseManagementDB Backup and Maintenance Scripts
-- SQL Server 2019+ compatible
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Script 1: Full Database Backup
---------------------------------------------------------------------
-- To run: Execute this script to create a full database backup
-- Backup location: Update the @BackupPath variable before executing

DECLARE @BackupPath NVARCHAR(500) = N'C:\Backup\EnterpriseManagementDB_Full_' + CONVERT(NVARCHAR(8), GETDATE(), 112) + N'.bak';
DECLARE @DatabaseName NVARCHAR(128) = DB_NAME();
DECLARE @BackupName NVARCHAR(128) = @DatabaseName + N' Full Backup - ' + CONVERT(NVARCHAR(20), GETDATE(), 120);

BACKUP DATABASE @DatabaseName
TO DISK = @BackupPath
WITH
    NAME = @BackupName,
    DESCRIPTION = N'Full database backup of EnterpriseManagementDB',
    COMPRESSION,
    CHECKSUM,
    STATS = 10;

PRINT N'Full database backup completed successfully.';
PRINT N'Backup path: ' + @BackupPath;
GO

---------------------------------------------------------------------
-- Script 2: Transaction Log Backup
---------------------------------------------------------------------
-- To run: Execute this script to create a transaction log backup
-- Requires database to be in FULL or BULK_LOGGED recovery model

DECLARE @LogBackupPath NVARCHAR(500) = N'C:\Backup\EnterpriseManagementDB_Log_' + CONVERT(NVARCHAR(8), GETDATE(), 112) + N'_' + REPLACE(CONVERT(NVARCHAR(8), GETDATE(), 108), N':', N'') + N'.trn';
DECLARE @LogBackupName NVARCHAR(128) = @DatabaseName + N' Transaction Log Backup - ' + CONVERT(NVARCHAR(20), GETDATE(), 120);

BACKUP LOG @DatabaseName
TO DISK = @LogBackupPath
WITH
    NAME = @LogBackupName,
    DESCRIPTION = N'Transaction log backup of EnterpriseManagementDB',
    COMPRESSION,
    CHECKSUM,
    STATS = 10;

PRINT N'Transaction log backup completed successfully.';
PRINT N'Backup path: ' + @LogBackupPath;
GO

---------------------------------------------------------------------
-- Script 3: Index Maintenance (Rebuild/Reorganize)
-- Rebuilds or reorganizes indexes based on fragmentation level
---------------------------------------------------------------------
-- Rebuild indexes with fragmentation > 30%
-- Reorganize indexes with fragmentation between 5% and 30%
-- Skip indexes with fragmentation < 5%

DECLARE @TableName SYSNAME;
DECLARE @IndexName SYSNAME;
DECLARE @Fragmentation FLOAT;
DECLARE @SQL NVARCHAR(MAX);
DECLARE @SchemaName SYSNAME;

DECLARE index_cursor CURSOR FOR
SELECT
    s.name AS SchemaName,
    t.name AS TableName,
    i.name AS IndexName,
    ps.avg_fragmentation_in_percent AS Fragmentation
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, N'LIMITED') ps
INNER JOIN sys.tables t ON ps.object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
INNER JOIN sys.indexes i ON ps.object_id = i.object_id AND ps.index_id = i.index_id
WHERE i.type_desc <> N'HEAP'
  AND ps.avg_fragmentation_in_percent > 5
  AND s.name = N'dbo';

OPEN index_cursor;
FETCH NEXT FROM index_cursor INTO @SchemaName, @TableName, @IndexName, @Fragmentation;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @Fragmentation > 30
    BEGIN
        SET @SQL = N'ALTER INDEX [' + @IndexName + N'] ON [' + @SchemaName + N'].[' + @TableName + N'] REBUILD WITH (FILLFACTOR = 80, SORT_IN_TEMPDB = ON, ONLINE = ON);';
        PRINT N'Rebuilding index: ' + @SchemaName + N'.' + @TableName + N'.' + @IndexName + N' (Fragmentation: ' + CAST(@Fragmentation AS NVARCHAR(10)) + N'%)';
    END
    ELSE IF @Fragmentation >= 5
    BEGIN
        SET @SQL = N'ALTER INDEX [' + @IndexName + N'] ON [' + @SchemaName + N'].[' + @TableName + N'] REORGANIZE;';
        PRINT N'Reorganizing index: ' + @SchemaName + N'.' + @TableName + N'.' + @IndexName + N' (Fragmentation: ' + CAST(@Fragmentation AS NVARCHAR(10)) + N'%)';
    END

    EXEC sp_executesql @SQL;
    FETCH NEXT FROM index_cursor INTO @SchemaName, @TableName, @IndexName, @Fragmentation;
END

CLOSE index_cursor;
DEALLOCATE index_cursor;

PRINT N'Index maintenance completed successfully.';
GO

---------------------------------------------------------------------
-- Script 4: Update Statistics
-- Updates statistics for all tables in the database
---------------------------------------------------------------------
DECLARE @TableName NVARCHAR(128);
DECLARE @SchemaName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);

DECLARE stats_cursor CURSOR FOR
SELECT s.name, t.name
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = N'dbo';

OPEN stats_cursor;
FETCH NEXT FROM stats_cursor INTO @SchemaName, @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = N'UPDATE STATISTICS [' + @SchemaName + N'].[' + @TableName + N'] WITH FULLSCAN;';
    PRINT N'Updating statistics for: ' + @SchemaName + N'.' + @TableName;
    EXEC sp_executesql @SQL;
    FETCH NEXT FROM stats_cursor INTO @SchemaName, @TableName;
END

CLOSE stats_cursor;
DEALLOCATE stats_cursor;

PRINT N'Statistics update completed successfully.';
GO

---------------------------------------------------------------------
-- Script 5: Database Integrity Check (DBCC CHECKDB)
---------------------------------------------------------------------
-- Run this script to check database integrity
-- Note: This can be resource-intensive on large databases

PRINT N'Starting database integrity check...';

DBCC CHECKDB (N'EnterpriseManagementDB')
WITH
    NO_INFOMSGS,
    ALL_ERRORMSGS,
    EXTENDED_LOGICAL_CHECKS,
    TABLERESULTS;

PRINT N'Database integrity check completed. Review results above.';
GO

---------------------------------------------------------------------
-- Script 6: Cleanup Old Audit Logs (Optional Maintenance)
-- Removes audit logs older than specified retention period
---------------------------------------------------------------------
-- Adjust the retention period as needed (default: 90 days)

DECLARE @RetentionDays INT = 90;
DECLARE @CutoffDate DATETIME2 = DATEADD(DAY, -@RetentionDays, GETUTCDATE());

PRINT N'Cleaning up audit logs older than ' + CAST(@RetentionDays AS NVARCHAR(10)) + N' days...';

DELETE FROM dbo.AuditLogs
WHERE CreatedAt < @CutoffDate;

PRINT N'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' old audit log records.';
GO

---------------------------------------------------------------------
-- Script 7: Cleanup Expired Refresh Tokens (Optional Maintenance)
---------------------------------------------------------------------
PRINT N'Cleaning up expired refresh tokens...';

DELETE FROM dbo.RefreshTokens
WHERE ExpiresAt < GETUTCDATE() OR IsRevoked = 1;

PRINT N'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' expired refresh tokens.';
GO

---------------------------------------------------------------------
-- Script 8: Maintenance Job Summary
-- Create a SQL Server Agent job to run maintenance tasks regularly
---------------------------------------------------------------------
/*
USE msdb;
GO

-- Create a maintenance job
DECLARE @jobId BINARY(16);

EXEC sp_add_job
    @job_name = N'EnterpriseManagementDB Maintenance',
    @description = N'Daily maintenance tasks for EnterpriseManagementDB',
    @enabled = 1,
    @owner_login_name = N'sa',
    @job_id = @jobId OUTPUT;

-- Step 1: Update statistics
EXEC sp_add_jobstep
    @job_id = @jobId,
    @step_name = N'Update Statistics',
    @subsystem = N'TSQL',
    @command = N'USE EnterpriseManagementDB; UPDATE STATISTICS dbo.Products WITH FULLSCAN; UPDATE STATISTICS dbo.Orders WITH FULLSCAN; UPDATE STATISTICS dbo.Invoices WITH FULLSCAN; UPDATE STATISTICS dbo.Customers WITH FULLSCAN;',
    @on_success_action = 1,
    @on_fail_action = 2;

-- Step 2: Cleanup expired tokens
EXEC sp_add_jobstep
    @job_id = @jobId,
    @step_name = N'Cleanup Expired Tokens',
    @subsystem = N'TSQL',
    @command = N'USE EnterpriseManagementDB; DELETE FROM dbo.RefreshTokens WHERE ExpiresAt < GETUTCDATE() OR IsRevoked = 1;',
    @on_success_action = 1,
    @on_fail_action = 2;

-- Step 3: Cleanup old audit logs (older than 90 days)
EXEC sp_add_jobstep
    @job_id = @jobId,
    @step_name = N'Cleanup Old Audit Logs',
    @subsystem = N'TSQL',
    @command = N'USE EnterpriseManagementDB; DELETE FROM dbo.AuditLogs WHERE CreatedAt < DATEADD(DAY, -90, GETUTCDATE());',
    @on_success_action = 1,
    @on_fail_action = 2;

-- Schedule: Daily at 2 AM
EXEC sp_add_schedule
    @schedule_name = N'Daily Maintenance Schedule',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 020000;

EXEC sp_attach_schedule
    @job_id = @jobId,
    @schedule_name = N'Daily Maintenance Schedule';

EXEC sp_add_jobserver
    @job_id = @jobId,
    @server_name = @@SERVERNAME;

PRINT N'Maintenance job created successfully.';
GO
*/

---------------------------------------------------------------------
-- Maintenance scripts creation complete
---------------------------------------------------------------------
PRINT N'Backup and maintenance scripts are ready for EnterpriseManagementDB.';
GO
