package com.ecoreturn.service;

import com.ecoreturn.entity.Rvm;
import org.springframework.stereotype.Service;

@Service
public class GeofenceService {

    private static final int GEOFENCE_RADIUS_METERS = 150;

    public boolean isWithinGeofence(Rvm rvm, double userLat, double userLng) {
        int distance = calculateDistance(rvm.getLatitude(), rvm.getLongitude(), userLat, userLng);
        return distance <= GEOFENCE_RADIUS_METERS;
    }

    public int calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (int) (earthRadius * c);
    }
}
