import { useState, useMemo, useRef } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { NotificationDetail } from "@/components/NotificationDetail";
import { notificationsData, Notification } from "@/data/notifications";

interface LastOperation {
  ids: number[];
  originalStatus: 'read' | 'unread';
  timestamp: number;
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(null);
  const [showPlainView, setShowPlainView] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Restore original status
    setNotifications((prev) =>
      prev.map((notification) =>
        lastOperation.ids.includes(notification.id)
          ? { ...notification, status: lastOperation.originalStatus }
          : notification
      )
    );

    setLastOperation(null);
  };

  const handleMarkAsRead = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    const originalStatus = notification?.status || 'unread';

    // Immediately mark as read
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "read" as const }
          : notification
      )
    );

    startUndoTimer([id], originalStatus);
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
    // Immediately mark all as read
    setNotifications((prev) =>
      prev.map((notification) =>
        ids.includes(notification.id)
          ? { ...notification, status: "read" as const }
          : notification
      )
    );

    startUndoTimer(ids, 'unread');
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);

    // If it's a Mention, move to Unanswered (stays unread)
    if (notification.group === "Mentions" || notification.originalGroup === "Mentions") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                viewed: true,
                originalGroup: "Mentions" as const,
                group: "Unanswered" as const,
              }
            : n
        )
      );
    } else if (notification.status === "unread") {
      // For non-mention unread notifications, immediately mark as read
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, status: "read" as const }
            : n
        )
      );

      startUndoTimer([notification.id], 'unread');
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
