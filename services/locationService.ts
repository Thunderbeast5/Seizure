import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  address?: string;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.LocationPermissionResponse['status'];
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private watchId: Location.LocationSubscription | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  async requestLocationPermissions(): Promise<LocationPermissionStatus> {
    try {
      // Check if location services are enabled
      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use emergency location features.',
          [{ text: 'OK' }]
        );
        return {
          granted: false,
          canAskAgain: false,
          status: Location.PermissionStatus.DENIED
        };
      }

      // Request foreground permissions
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        const message = canAskAgain 
          ? 'Location permission is required for emergency features. Please grant permission to continue.'
          : 'Location permission was denied. Please enable it in Settings > Privacy & Security > Location Services.';
        
        Alert.alert('Location Permission Required', message, [{ text: 'OK' }]);
        
        return {
          granted: false,
          canAskAgain,
          status
        };
      }

      return {
        granted: true,
        canAskAgain: true,
        status
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED
      };
    }
  }

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(timeout: number = 15000): Promise<LocationData | null> {
    try {
      const permissionStatus = await this.requestLocationPermissions();
      if (!permissionStatus.granted) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      // Try to get address (reverse geocoding)
      try {
        const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        locationData.address = address;
      } catch (error) {
        console.warn('Could not get address for location:', error);
      }

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        Alert.alert(
          'Location Timeout',
          'Unable to get your location. Please make sure you are not indoors and try again.',
          [{ text: 'OK' }]
        );
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        Alert.alert(
          'Location Unavailable',
          'Location services are temporarily unavailable. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
      return null;
    }
  }

  /**
   * Start watching location changes for real-time tracking
   */
  async startLocationTracking(callback: (location: LocationData) => void): Promise<boolean> {
    try {
      const permissionStatus = await this.requestLocationPermissions();
      if (!permissionStatus.granted) {
        return false;
      }

      // Stop existing tracking if any
      if (this.watchId) {
        this.stopLocationTracking();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          // Try to get address for the new location
          try {
            const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
            locationData.address = address;
          } catch (error) {
            console.warn('Could not get address for tracked location:', error);
          }

          this.currentLocation = locationData;
          callback(locationData);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocodedAddress.length > 0) {
        const address = reverseGeocodedAddress[0];
        const parts = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Generate Google Maps URL for the given coordinates
   */
  generateMapsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  /**
   * Generate Apple Maps URL for the given coordinates (iOS)
   */
  generateAppleMapsUrl(latitude: number, longitude: number): string {
    return `http://maps.apple.com/?q=${latitude},${longitude}`;
  }

  /**
   * Check if location services are available and enabled
   */
  async isLocationAvailable(): Promise<boolean> {
    try {
      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) return false;

      const { status } = await Location.getForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error checking location availability:', error);
      return false;
    }
  }
}

export default LocationService.getInstance();
