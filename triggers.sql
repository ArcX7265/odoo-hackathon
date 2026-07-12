DELIMITER //

-- Validation Trigger: Prevents dispatching if the vehicle or driver is not fit for the trip.
CREATE TRIGGER before_trip_dispatch
BEFORE UPDATE ON trips
FOR EACH ROW
BEGIN
    DECLARE v_vehicle_status VARCHAR(50);
    DECLARE v_driver_status VARCHAR(50);

    -- Only run validation if the status is changing to 'Dispatched'
    IF NEW.status = 'Dispatched' AND OLD.status != 'Dispatched' THEN
        
        -- Get the current vehicle status
        SELECT status INTO v_vehicle_status FROM vehicles WHERE id = NEW.vehicle_id;
        
        IF v_vehicle_status IN ('In Shop', 'Retired') THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Dispatch blocked: Vehicle is currently In Shop or Retired.';
        END IF;

        -- Get the current driver status
        SELECT status INTO v_driver_status FROM drivers WHERE id = NEW.driver_id;
        
        IF v_driver_status = 'Suspended' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Dispatch blocked: Driver is currently Suspended.';
        END IF;
        
    END IF;
END;
//

-- State Transition Trigger: Automatically syncs driver & vehicle statuses based on trip progress.
CREATE TRIGGER after_trip_status_update
AFTER UPDATE ON trips
FOR EACH ROW
BEGIN
    -- Transition to 'On Trip' when dispatched
    IF NEW.status = 'Dispatched' AND OLD.status != 'Dispatched' THEN
        UPDATE vehicles SET status = 'On Trip' WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'On Trip' WHERE id = NEW.driver_id;
        
    -- Revert back to 'Available' when resolved (completed or cancelled)
    ELSEIF NEW.status IN ('Completed', 'Cancelled') AND OLD.status NOT IN ('Completed', 'Cancelled') THEN
        UPDATE vehicles SET status = 'Available' WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'Available' WHERE id = NEW.driver_id;
    END IF;
END;
//

DELIMITER ;
