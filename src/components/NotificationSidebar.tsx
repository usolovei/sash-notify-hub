import { useState, useMemo } from "react";
import { X, Search, CheckCircle2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/data/notifications";
import { NotificationGroup } from "./NotificationGroup";
import { NotificationSettings } from "./NotificationSettings";

interface PendingOperation {
  ids: number[];
  timer: NodeJS.Timeout;
  type: 'individual' | 'group' | 'detail';
  group?: string;
  originalGroup?: string;
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string, ids: number[]) => void;
  onUndoGroupRead: (group: string) => void;
  onNotificationClick: (notification: Notification) => void;
  pendingOperations: Map<string, PendingOperation>;
  onUndoPendingOperation: (key: string) => void;
  onPin: (id: number) => void;
  onUnpin: (id: number) => void;
}

export const NotificationSidebar = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkGroupAsRead,
  onUndoGroupRead,
  onNotificationClick,
  pendingOperations,
  onUndoPendingOperation,
  onPin,
  onUnpin,
}: NotificationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [dateFilter, setDateFilter] = useState("All Time");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        searchQuery === "" ||
        notification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        moduleFilter === "All Modules" || notification.module === moduleFilter;

      const matchesPriority =
        priorityFilter === "All Priorities" || notification.priority === priorityFilter.toLowerCase();

      const matchesDate = (() => {
        if (dateFilter === "All Time") return true;
        const now = new Date();
        const notificationDate = notification.createdAt;
        
        if (dateFilter === "Today") {
          return notificationDate.toDateString() === now.toDateString();
        } else if (dateFilter === "This Week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return notificationDate >= weekAgo;
        } else if (dateFilter === "This Month") {
          return notificationDate.getMonth() === now.getMonth() && 
                 notificationDate.getFullYear() === now.getFullYear();
        }
        return true;
      })();

      return matchesSearch && matchesModule && matchesPriority && matchesDate;
    });
  }, [notifications, searchQuery, moduleFilter, priorityFilter, dateFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Mentions: [],
      "Assigned to Me": [],
      "Task Updates": [],
      Unanswered: [],
    };

    filteredNotifications.forEach((notification) => {
      if (notification.pinned) return;
      
      // Check if this notification has a pending operation
      const hasPendingOp = Array.from(pendingOperations.values()).some(op => 
        op.ids.includes(notification.id)
      );
      
      // If it has a pending operation, show it in its original group
      if (hasPendingOp) {
        const pendingOp = Array.from(pendingOperations.values()).find(op => 
          op.ids.includes(notification.id)
        );
        const originalGroup = pendingOp?.originalGroup;
        
        if (originalGroup && groups[originalGroup] !== undefined) {
          groups[originalGroup].push(notification);
        }
        return;
      }
      
      // Otherwise use normal grouping logic
      if (notification.status === "unread") {
        if (notification.group === "Unanswered" || (notification.originalGroup === "Mentions" && notification.viewed && notification.status === "unread")) {
          groups.Unanswered.push(notification);
        } else {
          groups[notification.group].push(notification);
        }
      }
    });

    // Sort by priority within each group (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    });

    return groups;
  }, [filteredNotifications, pendingOperations]);

  const pinnedNotifications = useMemo(() => {
    const pinned = filteredNotifications.filter((n) => n.pinned);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return pinned.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [filteredNotifications]);

  const seenNotifications = useMemo(() => {
    // Filter out notifications with pending operations (they should stay in original group)
    const seen = filteredNotifications.filter((n) => {
      if (n.status !== "read" || n.pinned) return false;
      
      const hasPendingOp = Array.from(pendingOperations.values()).some(op => 
        op.ids.includes(n.id)
      );
      
      return !hasPendingOp;
    });
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return seen.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [filteredNotifications, pendingOperations]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              Notifications
            </h2>
            <div className="flex items-center gap-2">
              <NotificationSettings />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Notifications"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Time">All Time</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Priorities">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Modules">All Modules</SelectItem>
                <SelectItem value="Tasks">Tasks</SelectItem>
                <SelectItem value="CRM Requests">CRM Requests</SelectItem>
                <SelectItem value="Care Service">Care Service</SelectItem>
                <SelectItem value="Knowledge Base">Knowledge Base</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Groups */}
        <div className="flex-1 overflow-y-auto">
          {/* Show Pinned group first */}
          {pinnedNotifications.length > 0 && (
            <NotificationGroup
              key="Pinned"
              groupName="Pinned"
              notifications={pinnedNotifications}
              unreadCount={0}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onMarkGroupAsRead={onMarkGroupAsRead}
              onUndoGroupRead={onUndoGroupRead}
              onNotificationClick={onNotificationClick}
              pendingOperations={pendingOperations}
              onUndoPendingOperation={onUndoPendingOperation}
              onPin={onPin}
              onUnpin={onUnpin}
            />
          )}

          {/* Show unread groups */}
          {["Mentions", "Assigned to Me", "Task Updates", "Unanswered"].map((groupName) => {
            const groupNotifications = groupedNotifications[groupName];
            const unreadCount = groupNotifications?.filter(n => n.status === "unread").length || 0;
            
            if (!groupNotifications || groupNotifications.length === 0) return null;

            return (
              <NotificationGroup
                key={groupName}
                groupName={groupName}
                notifications={groupNotifications}
                unreadCount={unreadCount}
                onMarkAsRead={onMarkAsRead}
                onMarkAsUnread={onMarkAsUnread}
                onMarkGroupAsRead={onMarkGroupAsRead}
                onUndoGroupRead={onUndoGroupRead}
                onNotificationClick={onNotificationClick}
                pendingOperations={pendingOperations}
                onUndoPendingOperation={onUndoPendingOperation}
                onPin={onPin}
                onUnpin={onUnpin}
              />
            );
          })}
          
          {/* Show Seen group at the bottom */}
          {seenNotifications.length > 0 && (
            <NotificationGroup
              key="Seen"
              groupName="Seen"
              notifications={seenNotifications}
              unreadCount={0}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onMarkGroupAsRead={onMarkGroupAsRead}
              onUndoGroupRead={onUndoGroupRead}
              onNotificationClick={onNotificationClick}
              pendingOperations={pendingOperations}
              onUndoPendingOperation={onUndoPendingOperation}
              onPin={onPin}
              onUnpin={onUnpin}
            />
          )}
        </div>
      </div>
    </>
  );
};
