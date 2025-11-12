import { useState, useMemo, useRef } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { NotificationDetail } from "@/components/NotificationDetail";
import { notificationsData, Notification } from "@/data/notifications";

interface PendingOperation {
  ids: number[];
  timer: NodeJS.Timeout;
  type: 'individual' | 'group' | 'detail';
  group?: string;
  originalStatus?: 'read' | 'unread';
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [groupReadHistory, setGroupReadHistory] = useState<Map<string, Notification[]>>(new Map());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<Map<string, PendingOperation>>(new Map());
  const operationCounterRef = useRef(0);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === "unread").length;
  }, [notifications]);

  const handleMarkAsRead = (id: number) => {
    const opKey = `individual-${id}`;
    
    // Cancel any existing operation for this notification
    const existing = pendingOperations.get(opKey);
    if (existing) {
      clearTimeout(existing.timer);
    }

    // Store original status before changing
    const notification = notifications.find(n => n.id === id);
    const originalStatus = notification?.status || 'unread';

    // Immediately mark as read (moves to Seen group)
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "read" as const }
          : notification
      )
    );

    const timer = setTimeout(() => {
      // After timer expires, just clean up the pending operation
      setPendingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(opKey);
        return newMap;
      });
    }, 3000);

    setPendingOperations((prev) => new Map(prev).set(opKey, {
      ids: [id],
      timer,
      type: 'individual',
      originalStatus
    }));
  };

  const handleUndoPendingOperation = (key: string) => {
    const operation = pendingOperations.get(key);
    if (operation) {
      clearTimeout(operation.timer);
      
      // Restore original status for the notifications
      if (operation.originalStatus) {
        setNotifications((prev) =>
          prev.map((notification) =>
            operation.ids.includes(notification.id)
              ? { ...notification, status: operation.originalStatus }
              : notification
          )
        );
      }
      
      setPendingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
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
    const opKey = `group-${group}`;
    
    // Cancel any existing operation for this group
    const existing = pendingOperations.get(opKey);
    if (existing) {
      clearTimeout(existing.timer);
    }

    // Immediately mark all as read (moves to Seen group)
    setNotifications((prev) =>
      prev.map((notification) =>
        ids.includes(notification.id)
          ? { ...notification, status: "read" as const }
          : notification
      )
    );

    const timer = setTimeout(() => {
      // After timer expires, just clean up the pending operation
      setPendingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(opKey);
        return newMap;
      });
    }, 3000);

    setPendingOperations((prev) => new Map(prev).set(opKey, {
      ids,
      timer,
      type: 'group',
      group,
      originalStatus: 'unread'
    }));
  };

  const handleUndoGroupRead = (group: string) => {
    const opKey = `group-${group}`;
    handleUndoPendingOperation(opKey);
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
      const opKey = `detail-${notification.id}`;
      
      // Cancel any existing operation for this notification
      const existing = pendingOperations.get(opKey);
      if (existing) {
        clearTimeout(existing.timer);
      }

      // Immediately mark as read (moves to Seen group)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, status: "read" as const }
            : n
        )
      );

      const timer = setTimeout(() => {
        // After timer expires, just clean up the pending operation
        setPendingOperations((prev) => {
          const newMap = new Map(prev);
          newMap.delete(opKey);
          return newMap;
        });
      }, 3000);

      setPendingOperations((prev) => new Map(prev).set(opKey, {
        ids: [notification.id],
        timer,
        type: 'detail',
        originalStatus: 'unread'
      }));
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
        onUndoGroupRead={handleUndoGroupRead}
        onNotificationClick={handleNotificationClick}
        pendingOperations={pendingOperations}
        onUndoPendingOperation={handleUndoPendingOperation}
        onPin={handlePin}
        onUnpin={handleUnpin}
      />

      <NotificationDetail
        notification={selectedNotification}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAnswer={handleAnswer}
        pendingOperations={pendingOperations}
        onUndoPendingOperation={handleUndoPendingOperation}
      />
    </div>
  );
};

export default Index;
