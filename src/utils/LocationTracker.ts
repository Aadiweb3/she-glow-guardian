export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
  timestamp: number;
}

export class LocationTracker {
  private watchId: number | null = null;
  private onLocationUpdate: (location: LocationData) => void;

  constructor(onLocationUpdate: (location: LocationData) => void) {
    this.onLocationUpdate = onLocationUpdate;
  }

  async start(): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }

    return new Promise((resolve, reject) => {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Try to get address from coordinates (reverse geocoding)
          try {
            location.address = await this.reverseGeocode(location.lat, location.lng);
          } catch (error) {
            console.warn("Failed to get address:", error);
          }

          this.onLocationUpdate(location);
          resolve();
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );
    });
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log("Location tracking stopped");
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Using a simple reverse geocoding approach
    // In production, use a proper geocoding service
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          try {
            location.address = await this.reverseGeocode(location.lat, location.lng);
          } catch (error) {
            console.warn("Failed to get address:", error);
          }

          resolve(location);
        },
        reject,
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
          }
      );
    });
  }
}
