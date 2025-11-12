import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/data/notifications";
import { Undo2, Check } from "lucide-react";

interface NotificationGroupProps {
  groupName: string;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string) => void;
  onUndoGroupRead: (group: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationGroup = ({
  groupName,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkGroupAsRead,
  onUndoGroupRead,
  onNotificationClick,
}: NotificationGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  const displayedNotifications = isExpanded
    ? notifications
    : notifications.slice(0, 3);

  const handleMarkAsRead = () => {
    onMarkGroupAsRead(groupName);
    setShowUndo(true);
  };

  const handleMarkAllAsUnread = () => {
    // Mark all seen notifications as unread
    const notificationsToMark = isExpanded ? notifications : notifications.slice(0, 3);
    
    notificationsToMark.forEach((notification) => {
      if (notification.status === "read") {
        onMarkAsUnread(notification.id);
      }
    });
    
    setShowUndo(true);
  };

  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        setShowUndo(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const handleUndo = () => {
    onUndoGroupRead(groupName);
    setShowUndo(false);
  };

  // For "Seen" group, show mark all as read button instead
  const isSeenGroup = groupName === "Seen";
  const isUnansweredGroup = groupName === "Unanswered";

  return (
    <div className="border-b last:border-b-0">
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">
            {groupName} ({notifications.length})
          </span>
          
          {!isSeenGroup && !isUnansweredGroup && unreadCount > 0 && (
            <div className="flex items-center gap-1">
              {showUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="h-7 text-xs gap-1"
                >
                  <Undo2 className="h-3 w-3" />
                  Undo
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAsRead}
                className="h-7 w-7 hover:bg-primary/10"
                title={isExpanded ? "Mark all as read" : "Mark top 3 as read"}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isUnansweredGroup && unreadCount > 0 && (
            <div className="flex items-center gap-1">
              {showUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="h-7 text-xs gap-1"
                >
                  <Undo2 className="h-3 w-3" />
                  Undo
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAsRead}
                className="h-7 w-7 hover:bg-primary/10"
                title={isExpanded ? "Mark all as read" : "Mark top 3 as read"}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isSeenGroup && notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {showUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="h-7 text-xs gap-1"
                >
                  <Undo2 className="h-3 w-3" />
                  Undo
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsUnread}
                className="h-7 text-xs hover:bg-primary/10"
                title={isExpanded ? "Mark all as unread" : "Mark top 3 as unread"}
              >
                Mark all as unread
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y">
        {displayedNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onNotificationClick={onNotificationClick}
          />
        ))}
      </div>

      {notifications.length > 3 && (
        <div className="px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-primary hover:text-primary"
          >
            {isExpanded ? "Show Less" : `See All →`}
          </Button>
        </div>
      )}
    </div>
  );
};
