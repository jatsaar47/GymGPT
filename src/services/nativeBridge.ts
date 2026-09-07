import { Capacitor, registerPlugin } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Network } from "@capacitor/network";

export interface NativeHealthData {
  connected: boolean;
  stepsToday: number;
  caloriesBurned: number;
  distanceMeters: number;
  weightKg: number;
  lastSync: number;
}

export interface NativeHealthConnectPlugin {
  isAvailable(): Promise<{ isAvailable: boolean; sdkVersion?: number; packageName?: string }>;
  openHealthConnectSettings(): Promise<{ success: boolean }>;
  getHealthData(): Promise<NativeHealthData>;
}

// Register the native Android plugin registered in MainActivity.java
export const NativeHealthConnect = registerPlugin<NativeHealthConnectPlugin>("NativeHealthConnect");

export class NativeBridgeService {
  private static isInitialized = false;

  /**
   * Initializes all native Android behaviors:
   * 1. Status bar coloring & overlay
   * 2. Splash screen dismissal
   * 3. Hardware back button interception
   * 4. Android lifecycle & network events
   */
  public static async init(options?: {
    onHardwareBack?: () => boolean; // return true if handled (e.g. modal closed)
    onNetworkChange?: (connected: boolean) => void;
  }): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!Capacitor.isNativePlatform()) {
      console.log("[NativeBridge] Running in Web / PWA mode");
      return;
    }

    console.log("[NativeBridge] Initializing Native Android Layer...");

    try {
      // 1. Android Status Bar Styling
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#080808" });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn("[NativeBridge] StatusBar setup error:", e);
    }

    try {
      // 2. Hide Splash Screen smoothly once React UI is ready
      await SplashScreen.hide();
    } catch (e) {
      console.warn("[NativeBridge] SplashScreen hide error:", e);
    }

    try {
      // 3. Hardware Back Button Listener
      App.addListener("backButton", ({ canGoBack }) => {
        // If consumer handled it (e.g. active modal closed, navigated to home)
        if (options?.onHardwareBack && options.onHardwareBack()) {
          return;
        }

        if (canGoBack) {
          window.history.back();
        } else {
          // Minimize app rather than abruptly crashing/exiting
          App.minimizeApp();
        }
      });
    } catch (e) {
      console.warn("[NativeBridge] BackButton listener error:", e);
    }

    try {
      // 4. Network Status Listener
      Network.addListener("networkStatusChange", (status) => {
        console.log("[NativeBridge] Network status changed:", status.connected);
        if (options?.onNetworkChange) {
          options.onNetworkChange(status.connected);
        }
      });
    } catch (e) {
      console.warn("[NativeBridge] Network listener error:", e);
    }
  }

  /**
   * Request Android Notification Permission and schedule daily fitness reminders
   */
  public static async scheduleWorkoutReminder(hour: number = 18, minute: number = 0): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") {
        return false;
      }

      // Schedule recurring workout reminder
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 101,
            title: "GymGPT: Workout Time! 💪",
            body: "Consistency drives progressive overload. Today's working sets are waiting for you!",
            schedule: {
              on: {
                hour,
                minute,
              },
              repeats: true,
            },
            smallIcon: "ic_stat_gymgpt",
            iconColor: "#E2FF31",
          },
        ],
      });
      return true;
    } catch (err) {
      console.warn("[NativeBridge] Notification scheduling error:", err);
      return false;
    }
  }

  /**
   * Schedule Water Hydration Reminder
   */
  public static async scheduleWaterReminder(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") return false;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 201,
            title: "GymGPT: Hydration Check 💧",
            body: "Maintain muscle volumization and protein synthesis. Drink a glass of water now!",
            schedule: {
              every: "hour",
              repeats: true,
            },
            smallIcon: "ic_stat_gymgpt",
            iconColor: "#38BDF8",
          },
        ],
      });
      return true;
    } catch (err) {
      console.warn("[NativeBridge] Water notification error:", err);
      return false;
    }
  }

  /**
   * Check if native Android Health Connect is available
   */
  public static async checkHealthConnectAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const res = await NativeHealthConnect.isAvailable();
      return !!res?.isAvailable;
    } catch (err) {
      console.warn("[NativeBridge] Health Connect check error:", err);
      return false;
    }
  }

  /**
   * Open Android Health Connect System Permissions Settings
   */
  public static async openHealthConnectSettings(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const res = await NativeHealthConnect.openHealthConnectSettings();
      return !!res?.success;
    } catch (err) {
      console.warn("[NativeBridge] Open Health Connect error:", err);
      return false;
    }
  }

  /**
   * Fetch Health Connect synced metrics from native Android layer
   */
  public static async fetchNativeHealthMetrics(): Promise<NativeHealthData | null> {
    if (!Capacitor.isNativePlatform()) return null;
    try {
      return await NativeHealthConnect.getHealthData();
    } catch (err) {
      console.warn("[NativeBridge] Fetch native health data error:", err);
      return null;
    }
  }

  public static isNativeAndroid(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  }
}
