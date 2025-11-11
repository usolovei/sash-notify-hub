import { useState, useMemo } from "react";
import { X, Search, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Notification } from "@/data/notifications";
import { NotificationGroup } from "./NotificationGroup";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string) => void;
  onUndoGroupRead: (group: string) => void;
  onNotificationClick: (notification: Notification) => void;
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
}: NotificationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        searchQuery === "" ||
        notification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        moduleFilter === "All Modules" || notification.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [notifications, searchQuery, moduleFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Mentions: [],
      "Assigned to Me": [],
      "Task Updates": [],
      Unanswered: [],
      Seen: [],
    };

    filteredNotifications.forEach((notification) => {
      if (notification.status === "read") {
        groups.Seen.push(notification);
      } else if (notification.group === "Unanswered" || (notification.originalGroup === "Mentions" && notification.viewed && notification.status === "unread")) {
        groups.Unanswered.push(notification);
      } else {
        groups[notification.group].push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

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
        className={`fixed top-0 right-0 h-full w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
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
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Notifications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
          {/* Show unread groups first */}
          {["Mentions", "Assigned to Me", "Task Updates", "Unanswered"].map((groupName) => {
            const groupNotifications = groupedNotifications[groupName];
            const unreadCount = groupNotifications.filter(n => n.status === "unread").length;
            
            if (groupNotifications.length === 0) return null;

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
              />
            );
          })}
          
          {/* Show Seen group at the bottom */}
          {groupedNotifications.Seen.length > 0 && (
            <NotificationGroup
              key="Seen"
              groupName="Seen"
              notifications={groupedNotifications.Seen}
              unreadCount={0}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onMarkGroupAsRead={onMarkGroupAsRead}
              onUndoGroupRead={onUndoGroupRead}
              onNotificationClick={onNotificationClick}
            />
          )}
        </div>
      </div>
    </>
  );
};
