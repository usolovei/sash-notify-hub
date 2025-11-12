import { useState } from "react";
import { Circle, CheckCircle2, CheckSquare, Users, Headphones, Book, Undo2, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/data/notifications";
import { cn } from "@/lib/utils";
import { UndoTimer } from "./UndoTimer";

interface PendingOperation {
  ids: number[];
  timer: NodeJS.Timeout;
  type: 'individual' | 'group' | 'detail';
  group?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onNotificationClick: (notification: Notification) => void;
  pendingOperations: Map<string, PendingOperation>;
  onUndoPendingOperation: (key: string) => void;
  onPin: (id: number) => void;
  onUnpin: (id: number) => void;
  isPinned: boolean;
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
  pendingOperations,
  onUndoPendingOperation,
  onPin,
  onUnpin,
  isPinned,
}: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const individualOpKey = `individual-${notification.id}`;
  const detailOpKey = `detail-${notification.id}`;
  const hasPendingOperation = pendingOperations.has(individualOpKey);
  const hasPendingDetailOperation = pendingOperations.has(detailOpKey);

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

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUndoPendingOperation(individualOpKey);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(notification.id);
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnpin(notification.id);
  };

  const handleClick = () => {
    onNotificationClick(notification);
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
        "px-4 py-3 flex items-start gap-3 transition-all relative group cursor-pointer",
        isUnread ? "bg-notification-unread" : "bg-background hover:bg-muted/30",
        hasPendingDetailOperation && "opacity-60"
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
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="outline"
                className={cn(
                  "h-4 px-1.5 text-[10px] font-medium border-0",
                  notification.priority === "high" && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                  notification.priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
                  notification.priority === "low" && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {notification.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium">{notification.name}</span>{" "}
              <span className="text-muted-foreground">{notification.description}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0">
            {hasPendingOperation ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="h-7 text-xs gap-1 hover:bg-primary/10"
              >
                <UndoTimer duration={3000} size={14} />
                <Undo2 className="h-3 w-3" />
                Undo
              </Button>
            ) : isPinned ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUnpin}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                title="Unpin"
              >
                <PinOff className="h-4 w-4 text-muted-foreground" />
              </Button>
            ) : (
              <>
                {isUnread ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePin}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                      title="Pin"
                    >
                      <Pin className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMarkAsRead}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                      title="Mark as read"
                    >
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePin}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                      title="Pin"
                    >
                      <Pin className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMarkAsUnread}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                      title="Mark as unread"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
