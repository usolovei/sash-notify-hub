import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/data/notifications";
import { Undo2 } from "lucide-react";

interface NotificationGroupProps {
  groupName: string;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string) => void;
  onUndoGroupRead: (group: string) => void;
}

export const NotificationGroup = ({
  groupName,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkGroupAsRead,
  onUndoGroupRead,
}: NotificationGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  const displayedNotifications = isExpanded
    ? notifications
    : notifications.slice(0, 3);

  const handleMarkAllAsRead = () => {
    onMarkGroupAsRead(groupName);
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

  return (
    <div className="border-b last:border-b-0">
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
          >
            {groupName} ({unreadCount})
          </button>
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
        </div>
      </div>

      <div className="divide-y">
        {displayedNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
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
            {isExpanded ? "Show Less" : `Show All →`}
          </Button>
        </div>
      )}
    </div>
  );
};
