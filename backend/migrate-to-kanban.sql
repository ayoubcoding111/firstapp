-- ============================================
-- Migration Script: Add Kanban Status Support (4 columns)
-- Run this to update your existing database
-- ============================================

USE todo_app;

-- Step 1: Modify the status column to support new statuses
ALTER TABLE todos
MODIFY COLUMN status ENUM('pending', 'in_progress', 'suspended', 'finished', 'completed', 'do_later') NOT NULL DEFAULT 'pending';

-- Step 2: Migrate old 'completed' status to 'finished'
UPDATE todos SET status = 'finished' WHERE status = 'completed';

-- Step 3: Migrate 'do_later' to 'pending' (if any exist)
UPDATE todos SET status = 'pending' WHERE status = 'do_later';

-- Step 4: Remove old statuses from enum (keeps it clean)
ALTER TABLE todos
MODIFY COLUMN status ENUM('pending', 'in_progress', 'suspended', 'finished') NOT NULL DEFAULT 'pending';

-- Done! Your database now supports the 4-column Kanban board statuses.
