export class MotionDetector {
  private lastX: number = 0;
  private lastY: number = 0;
  private lastZ: number = 0;
  private shakeThreshold: number = 25;
  private onShake: () => void;

  constructor(onShake: () => void) {
    this.onShake = onShake;
  }

  start(): void {
    if (typeof DeviceMotionEvent !== 'undefined') {
      if ((DeviceMotionEvent as any).requestPermission) {
        // iOS 13+ requires permission
        (DeviceMotionEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              this.attachListener();
            } else {
              console.warn("Motion permission denied");
            }
          })
          .catch(console.error);
      } else {
        // Non-iOS or older iOS
        this.attachListener();
      }
    } else {
      console.warn("DeviceMotionEvent not supported");
    }
  }

  private attachListener(): void {
    window.addEventListener('devicemotion', this.handleMotion);
    console.log("Motion detector started");
  }

  private handleMotion = (event: DeviceMotionEvent): void => {
    const acceleration = event.accelerationIncludingGravity;
    
    if (!acceleration) return;

    const { x = 0, y = 0, z = 0 } = acceleration;

    const deltaX = Math.abs(x - this.lastX);
    const deltaY = Math.abs(y - this.lastY);
    const deltaZ = Math.abs(z - this.lastZ);

    const shakeIntensity = deltaX + deltaY + deltaZ;

    if (shakeIntensity > this.shakeThreshold) {
      console.log("Shake detected! Intensity:", shakeIntensity);
      this.onShake();
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  };

  stop(): void {
    window.removeEventListener('devicemotion', this.handleMotion);
    console.log("Motion detector stopped");
  }
}
