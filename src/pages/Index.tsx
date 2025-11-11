import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { NotificationDetail } from "@/components/NotificationDetail";
import { notificationsData, Notification } from "@/data/notifications";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [groupReadHistory, setGroupReadHistory] = useState<Map<string, Notification[]>>(new Map());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === "unread").length;
  }, [notifications]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, status: "read" as const }
          : notification
      )
    );
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

  const handleMarkGroupAsRead = (group: string) => {
    const groupNotifications = notifications.filter(
      (n) => n.group === group && n.status === "unread"
    );
    
    setGroupReadHistory((prev) => new Map(prev).set(group, groupNotifications));
    
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.group === group && notification.status === "unread"
          ? { ...notification, status: "read" as const }
          : notification
      )
    );
  };

  const handleUndoGroupRead = (group: string) => {
    const historyItems = groupReadHistory.get(group);
    if (!historyItems) return;

    const historyIds = new Set(historyItems.map((n) => n.id));
    
    setNotifications((prev) =>
      prev.map((notification) =>
        historyIds.has(notification.id)
          ? { ...notification, status: "unread" as const }
          : notification
      )
    );
    
    setGroupReadHistory((prev) => {
      const newHistory = new Map(prev);
      newHistory.delete(group);
      return newHistory;
    });
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
