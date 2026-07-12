
package com.transitops.api.controllers;

import com.transitops.api.models.Trip;
import com.transitops.api.models.TripStatus;
import com.transitops.api.services.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @GetMapping("/available-assets")
    public ResponseEntity<Map<String, Object>> getAvailableAssets() {
        return ResponseEntity.ok(tripService.getAvailableAssets());
    }

    @PostMapping
    public ResponseEntity<Trip> createDraft(@RequestBody Trip trip) {
        return ResponseEntity.ok(tripService.createDraftTrip(trip));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Trip> updateStatus(@PathVariable Integer id, @RequestParam TripStatus status) {
        return ResponseEntity.ok(tripService.updateTripStatus(id, status));
    }
}
