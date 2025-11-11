import { useState } from "react";
import { Circle, CheckCircle2, CheckSquare, Users, Headphones, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Notification } from "@/data/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onNotificationClick: (notification: Notification) => void;
}

const moduleIcons = {
  Tasks: CheckSquare,
  "CRM Requests": Users,
  "Care Service": Headphones,
  "Knowledge Base": Book,
};

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onNotificationClick,
}: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const isUnread = notification.status === "unread";
  const ModuleIcon = moduleIcons[notification.module];

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsUnread(notification.id);
  };

  const handleClick = () => {
    onNotificationClick(notification);
    // Automatically mark as read when viewing
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "px-4 py-3 flex items-start gap-3 transition-colors relative group cursor-pointer",
        isUnread ? "bg-notification-unread" : "bg-background hover:bg-muted/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-notification-indicator rounded-r" />
      )}

      {/* Avatar with Module Icon */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(notification.name)}
          </AvatarFallback>
        </Avatar>
        {ModuleIcon && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
            <ModuleIcon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{notification.name}</span>{" "}
              <span className="text-muted-foreground">{notification.description}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0">
            {isUnread ? (
              // Unread notification: show mark as read button
              isHovered && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAsRead}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark as read"
                >
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )
            ) : (
              // Read notification: show mark as unread button
              isHovered && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAsUnread}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark as unread"
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
