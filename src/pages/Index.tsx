import { useState, useMemo, useRef, useCallback } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { NotificationDetail } from "@/components/NotificationDetail";
import { notificationsData, Notification } from "@/data/notifications";

interface LastOperation {
  ids: number[];
  originalStatus: 'read' | 'unread';
  timestamp: number;
}

// Spark-style transition: slide (300ms) + collapse (150ms) = 450ms.
// Must match the timings in NotificationItem.tsx.
const READ_TRANSITION_MS = 450;
const STAGGER_MS = 90;

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [pendingReadIds, setPendingReadIds] = useState<Set<number>>(new Set());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(null);
  const [showPlainView, setShowPlainView] = useState(false);
  const [showSeen, setShowSeen] = useState(() => {
    const saved = localStorage.getItem('notification-show-seen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showPriorities, setShowPriorities] = useState(() => {
    const saved = localStorage.getItem('notification-show-priorities');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleShowSeenChange = (value: boolean) => {
    setShowSeen(value);
    localStorage.setItem('notification-show-seen', JSON.stringify(value));
  };

  const handleShowPrioritiesChange = (value: boolean) => {
    setShowPriorities(value);
    localStorage.setItem('notification-show-priorities', JSON.stringify(value));
  };
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === "unread").length;
  }, [notifications]);

  const startUndoTimer = (ids: number[], originalStatus: 'read' | 'unread') => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Store the operation
    setLastOperation({
      ids,
      originalStatus,
      timestamp: Date.now(),
    });

    // Start new 3-second timer
    timerRef.current = setTimeout(() => {
      setLastOperation(null);
      timerRef.current = null;
    }, 3000);
  };

  const handleUndo = () => {
    if (!lastOperation) return;

    // Clear the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Restore original status and clear any pending read transition
    setNotifications((prev) =>
      prev.map((notification) =>
        lastOperation.ids.includes(notification.id)
          ? { ...notification, status: lastOperation.originalStatus }
          : notification
      )
    );
    setPendingReadIds((prev) => {
      const next = new Set(prev);
      lastOperation.ids.forEach((id) => next.delete(id));
      return next;
    });

    setLastOperation(null);
  };

  const commitRead = useCallback((ids: number[]) => {
    setNotifications((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, status: "read" as const } : n
      )
    );
    setPendingReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const handleMarkAsRead = (id: number) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.status === "read") return;

    // Visually mark as read immediately (transition starts), but keep status
    // as "unread" so the item stays in its current group during the animation.
    setPendingReadIds((prev) => new Set(prev).add(id));

    // Commit the actual status change after the transition completes.
    setTimeout(() => commitRead([id]), READ_TRANSITION_MS);

    startUndoTimer([id], "unread");
  };

  const handleMarkAsUnread = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "unread" as const }
          : notification
      )
    );
  };

  const handleMarkGroupAsRead = (group: string, ids: number[]) => {
    if (ids.length === 0) return;

    // Stagger the visual "read" transition top-to-bottom; commit each item's
    // real status only after its own transition has finished so items remain
    // visible in their current group during the cascade.
    ids.forEach((id, index) => {
      const startDelay = index * STAGGER_MS;
      setTimeout(() => {
        setPendingReadIds((prev) => new Set(prev).add(id));
      }, startDelay);
      setTimeout(() => commitRead([id]), startDelay + READ_TRANSITION_MS);
    });

    startUndoTimer(ids, "unread");
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);

    // Mark as read with the same in-place transition as the button.
    if (notification.status === "unread") {
      setPendingReadIds((prev) => new Set(prev).add(notification.id));
      setTimeout(() => commitRead([notification.id]), READ_TRANSITION_MS);
      startUndoTimer([notification.id], "unread");
    }
  };

  const handleAnswer = (notificationId: number) => {
    // Move to Seen (mark as read) when Answer button is clicked
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, status: "read" as const }
          : notification
      )
    );
  };

  const handlePin = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, pinned: true, status: "read" as const }
          : notification
      )
    );
  };

  const handleUnpin = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, pinned: false }
          : notification
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        unreadCount={unreadCount}
        onBellClick={() => setIsSidebarOpen(true)}
      />

      <main className="pt-16 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">SaaS Notification Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Click the bell icon to view your notifications
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">{unreadCount}</div>
                <div className="text-sm text-muted-foreground">Unread Notifications</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">{notifications.length}</div>
                <div className="text-sm text-muted-foreground">Total Notifications</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <div className="text-sm text-muted-foreground">Notification Groups</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NotificationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        notifications={notifications}
        pendingReadIds={pendingReadIds}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
        onMarkGroupAsRead={handleMarkGroupAsRead}
        onNotificationClick={handleNotificationClick}
        lastOperation={lastOperation}
        onUndo={handleUndo}
        onPin={handlePin}
        onUnpin={handleUnpin}
        showPlainView={showPlainView}
        onShowPlainViewChange={setShowPlainView}
        showSeen={showSeen}
        onShowSeenChange={handleShowSeenChange}
        showPriorities={showPriorities}
        onShowPrioritiesChange={handleShowPrioritiesChange}
      />

      <NotificationDetail
        notification={selectedNotification}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default Index;
