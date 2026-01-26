// // Session Management Service with Inactivity Timeout
// import { User } from './dataService';
// import { dataService } from './dataService';

// const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
// const SESSION_KEY = 'sms_session';
// const LAST_ACTIVITY_KEY = 'sms_last_activity';

// interface Session {
//   user: User;
//   loginTime: string;
//   expiresAt: string;
// }

// class SessionService {
//   private activityTimer: NodeJS.Timeout | null = null;

//   // Start session after successful login
//   startSession(user: User): void {
//     const now = new Date();
//     const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

//     const session: Session = {
//       user,
//       loginTime: now.toISOString(),
//       expiresAt: expiresAt.toISOString()
//     };

//     localStorage.setItem(SESSION_KEY, JSON.stringify(session));
//     this.updateLastActivity();
//     this.startActivityMonitoring();
//   }

//   // Get current session
//   getSession(): Session | null {
//     const sessionData = localStorage.getItem(SESSION_KEY);
//     if (!sessionData) return null;

//     try {
//       const session: Session = JSON.parse(sessionData);

//       // Check if session has expired
//       if (new Date() > new Date(session.expiresAt)) {
//         this.endSession();
//         return null;
//       }

//       // Check for inactivity timeout
//       if (this.isInactive()) {
//         this.endSession();
//         return null;
//       }

//       return session;
//     } catch (error) {
//       this.endSession();
//       return null;
//     }
//   }

//   // Update last activity timestamp
//   updateLastActivity(): void {
//     localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
//   }

//   // Check if user has been inactive for too long
//   private isInactive(): boolean {
//     const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
//     if (!lastActivity) return true;

//     const lastActivityTime = new Date(lastActivity).getTime();
//     const now = new Date().getTime();
//     const inactiveDuration = now - lastActivityTime;

//     return inactiveDuration > SESSION_TIMEOUT;
//   }

//   // Start monitoring user activity
//   private startActivityMonitoring(): void {
//     // Clear existing timer
//     if (this.activityTimer) {
//       clearInterval(this.activityTimer);
//     }

//     // Check for inactivity every minute
//     this.activityTimer = setInterval(() => {
//       if (this.isInactive()) {
//         this.endSession();
//         // Trigger session timeout event
//         window.dispatchEvent(new CustomEvent('sessionTimeout'));
//       }
//     }, 60000); // Check every minute

//     // Update activity on user interactions
//     const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
//     events.forEach(event => {
//       document.addEventListener(event, this.handleUserActivity);
//     });
//   }

//   private handleUserActivity = (): void => {
//     const session = this.getSession();
//     if (session) {
//       this.updateLastActivity();
//     }
//   };

//   // End session and cleanup
//   endSession(): void {
//     const session = this.getSession();
//     if (session) {
//       // Log session end
//       dataService.createAuditLog({
//         userId: session.user.id,
//         userRole: session.user.role,
//         action: 'logout',
//         entityType: 'User',
//         details: 'User session ended',
//         timestamp: new Date().toISOString()
//       });
//     }

//     localStorage.removeItem(SESSION_KEY);
//     localStorage.removeItem(LAST_ACTIVITY_KEY);

//     // Clear activity timer
//     if (this.activityTimer) {
//       clearInterval(this.activityTimer);
//       this.activityTimer = null;
//     }

//     // Remove event listeners
//     const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
//     events.forEach(event => {
//       document.removeEventListener(event, this.handleUserActivity);
//     });
//   }

//   // Get remaining session time in minutes
//   getRemainingTime(): number {
//     const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
//     if (!lastActivity) return 0;

//     const lastActivityTime = new Date(lastActivity).getTime();
//     const now = new Date().getTime();
//     const remaining = SESSION_TIMEOUT - (now - lastActivityTime);

//     return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
//   }

//   // Check if user is authenticated
//   isAuthenticated(): boolean {
//     return this.getSession() !== null;
//   }

//   // Get current user
//   getCurrentUser(): User | null {
//     const session = this.getSession();
//     return session ? session.user : null;
//   }
// }

// export const sessionService = new SessionService();

// Session Management Service with Inactivity Timeout
import { User } from "./dataService";
import { dataService } from "./dataService";

const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
const SESSION_KEY = "sms_session";
const LAST_ACTIVITY_KEY = "sms_last_activity";

interface Session {
  user: User;
  loginTime: string;
  expiresAt: string;
}

class SessionService {
  private activityTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = 0; // cache last activity
  private listenersAdded: boolean = false; // prevent duplicate event listeners

  // Start session after successful login
  startSession(user: User): void {
    const now = Date.now();
    const expiresAt = new Date(now + SESSION_TIMEOUT);

    const session: Session = {
      user,
      loginTime: new Date(now).toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.updateLastActivity();
    this.startActivityMonitoring();
  }

  // Get current session
  getSession(): Session | null {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
      const session: Session = JSON.parse(sessionData);

      // Check if session has expired
      if (new Date() > new Date(session.expiresAt)) {
        this.endSession();
        return null;
      }

      // Check for inactivity timeout
      if (this.isInactive()) {
        this.endSession();
        return null;
      }

      return session;
    } catch {
      this.endSession();
      return null;
    }
  }

  // Update last activity timestamp
  updateLastActivity(): void {
    const now = Date.now();
    this.lastActivityTime = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, new Date(now).toISOString());
  }

  // Check if user has been inactive for too long
  private isInactive(): boolean {
    const last =
      this.lastActivityTime ||
      new Date(localStorage.getItem(LAST_ACTIVITY_KEY) || 0).getTime();
    return Date.now() - last > SESSION_TIMEOUT;
  }

  // Start monitoring user activity
  private startActivityMonitoring(): void {
    // Clear existing timer
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Check for inactivity every minute
    this.activityTimer = setInterval(() => {
      if (this.isInactive()) {
        this.endSession();
        window.dispatchEvent(new CustomEvent("sessionTimeout"));
      }
    }, 60000);

    // Only add listeners once
    if (!this.listenersAdded) {
      const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
      events.forEach((event) => {
        document.addEventListener(event, this.handleUserActivity);
      });
      this.listenersAdded = true;
    }
  }

  private handleUserActivity = (): void => {
    const session = this.getSession();
    if (session) {
      this.updateLastActivity();
    }
  };

  // End session and cleanup
  endSession(): void {
    const session = this.getSession();
    if (session) {
      dataService.createAuditLog({
        userId: session.user.id,
        userRole: session.user.role,
        action: "logout",
        entityType: "User",
        details: "User session ended",
        timestamp: new Date().toISOString(),
      });
    }

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }

    if (this.listenersAdded) {
      const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
      events.forEach((event) => {
        document.removeEventListener(event, this.handleUserActivity);
      });
      this.listenersAdded = false;
    }
  }

  // Get remaining session time in minutes
  getRemainingTime(): number {
    const last =
      this.lastActivityTime ||
      new Date(localStorage.getItem(LAST_ACTIVITY_KEY) || 0).getTime();
    const remaining = SESSION_TIMEOUT - (Date.now() - last);
    return Math.max(0, Math.floor(remaining / 60000));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session ? session.user : null;
  }
}

export const sessionService = new SessionService();
