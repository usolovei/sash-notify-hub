import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/data/notifications";
import { Check, AtSign, UserCheck, ListTodo, HelpCircle, CheckSquare2, Pin, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const groupIcons = {
  "Mentions": AtSign,
  "Assigned to Me": UserCheck,
  "Task Updates": ListTodo,
  "Approval": CheckSquare2,
  "Unanswered": HelpCircle,
  "Pinned": Pin,
  "Seen": Eye,
};

const groupTooltips: Record<string, string> = {
  "Approval": "These tasks need your approval",
  "Mentions": "Someone mentioned you in the comments",
  "Assigned to Me": "Someone assigned you to a task",
  "Task Updates": "Someone updated a stage in a task related to you",
  "Seen": "You've already seen this notification",
};

interface NotificationGroupProps {
  groupName: string;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string, ids: number[]) => void;
  onNotificationClick: (notification: Notification) => void;
  onPin: (id: number) => void;
  onUnpin: (id: number) => void;
  showPriority?: boolean;
  initialVisible?: number;
}

export const NotificationGroup = ({
  groupName,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkGroupAsRead,
  onNotificationClick,
  onPin,
  onUnpin,
  showPriority = true,
  initialVisible = 3,
}: NotificationGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedNotifications = isExpanded
    ? notifications
    : notifications.slice(0, initialVisible);

  const handleMarkAsRead = () => {
    // Get IDs to mark as read based on expanded state
    const notificationsToMark = isExpanded ? notifications : notifications.slice(0, initialVisible);
    const idsToMark = notificationsToMark
      .filter(n => n.status === "unread")
      .map(n => n.id);
    
    if (idsToMark.length > 0) {
      onMarkGroupAsRead(groupName, idsToMark);
    }
  };

  const handleMarkAllAsUnread = () => {
    // Mark all seen notifications as unread
    const notificationsToMark = isExpanded ? notifications : notifications.slice(0, 3);
    
    notificationsToMark.forEach((notification) => {
      if (notification.status === "read") {
        onMarkAsUnread(notification.id);
      }
    });
  };

  // For "Seen" group, show mark all as read button instead
  const isSeenGroup = groupName === "Seen";
  const isUnansweredGroup = groupName === "Unanswered";
  const GroupIcon = groupIcons[groupName as keyof typeof groupIcons];

  return (
    <div className="border-b last:border-b-0">
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {GroupIcon && <GroupIcon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">
                    {groupName} ({notifications.length})
                  </span>
                </div>
              </TooltipTrigger>
              {groupTooltips[groupName] && (
                <TooltipContent>
                  <p>{groupTooltips[groupName]}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          {!isSeenGroup && !isUnansweredGroup && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAsRead}
              className="h-7 w-7 hover:bg-primary/10"
              title={isExpanded ? "Mark all as read" : "Mark top 3 as read"}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}

          {isUnansweredGroup && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAsRead}
              className="h-7 w-7 hover:bg-primary/10"
              title={isExpanded ? "Mark all as read" : "Mark top 3 as read"}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}

          {isSeenGroup && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsUnread}
              className="h-7 text-xs hover:bg-primary/10"
              title={isExpanded ? "Mark all as unread" : "Mark top 3 as unread"}
            >
              Mark all as unread
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
            onNotificationClick={onNotificationClick}
            onPin={onPin}
            onUnpin={onUnpin}
            isPinned={groupName === "Pinned"}
            showPinButton={true}
            showPriority={showPriority}
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
