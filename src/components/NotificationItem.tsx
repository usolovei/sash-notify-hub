import { useEffect, useState } from "react";
import { Circle, CheckCircle2, CheckSquare, Users, Headphones, Book, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/data/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onNotificationClick: (notification: Notification) => void;
  onPin: (id: number) => void;
  onUnpin: (id: number) => void;
  isPinned: boolean;
  showPinButton?: boolean;
  showPriority?: boolean;
  isPendingRead?: boolean;
}

const moduleIcons = {
  Tasks: CheckSquare,
  "CRM Requests": Users,
  "Care Service": Headphones,
  "Knowledge Base": Book,
};

// Spark-style slide timing — cards slide LEFT → RIGHT.
// Must match SLIDE_MS in ReadRevealWrapper.
const SLIDE_MS = 300;

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onNotificationClick,
  onPin,
  onUnpin,
  isPinned,
  showPinButton = true,
  showPriority = true,
  isPendingRead = false,
}: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  // Two-phase slide: when isPendingRead flips on, we render the card in its
  // normal position for one frame, THEN apply translate-x-full so the browser
  // animates the transition. Without this, the card mounts already slid.
  const [slideArmed, setSlideArmed] = useState(false);

  useEffect(() => {
    if (!isPendingRead) {
      setSlideArmed(false);
      return;
    }
    // Wait two frames to guarantee the initial (translate-x-0) styles
    // are committed before we toggle to translate-x-full.
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setSlideArmed(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [isPendingRead]);

  const isUnread = notification.status === "unread" && !isPendingRead;
  const ModuleIcon = moduleIcons[notification.module];

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsUnread(notification.id);
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
        "px-4 py-3 flex items-start gap-3 relative group cursor-pointer",
        "bg-background hover:bg-muted/30",
        // Slide LEFT → RIGHT when transitioning to read, revealing the
        // blue "Read" layer rendered behind by ReadRevealWrapper.
        "transition-transform ease-out",
        isPendingRead && slideArmed ? "translate-x-full" : "translate-x-0"
      )}
      style={{ transitionDuration: `${SLIDE_MS}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Unread background tint — present while truly unread. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-notification-unread pointer-events-none",
          "transition-opacity ease-out",
          isUnread ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${SLIDE_MS}ms` }}
      />

        {/* Unread Indicator */}
        <div
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-notification-indicator rounded-r",
            "transition-opacity ease-out",
            isUnread ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDuration: `${SLIDE_MS}ms` }}
        />

        {/* Avatar with Module Icon */}
        <div className="relative z-10 flex-shrink-0">
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
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className={cn(isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>{notification.name}</span>{" "}
                <span className={cn(isUnread ? "text-foreground/80" : "text-muted-foreground")}>{notification.description}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                {showPriority && notification.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1.5 text-[10px] font-medium border-0",
                      notification.priority === "high" && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                      notification.priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
                      notification.priority === "low" && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {notification.priority === "high" ? "NEED HIGH ATTENTION" : notification.priority === "medium" ? "MODERATE PRIORITY" : "LOW"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {showPinButton && isPinned ? (
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
                      {showPinButton && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePin}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                          title="Pin"
                        >
                          <Pin className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
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
                      {showPinButton && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePin}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                          title="Pin"
                        >
                          <Pin className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
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
