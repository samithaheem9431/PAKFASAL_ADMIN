import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase.js";

export function trackEvent(eventName, params = {}) {
  try {
    if (!analytics) return;
    logEvent(analytics, eventName, params);
  } catch {
    // Ignore analytics errors to avoid breaking admin workflows.
  }
}

