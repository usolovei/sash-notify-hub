import { useState, useMemo } from "react";
import { X, Search, CheckCircle2, Filter, AtSign, UserCheck, ListTodo, HelpCircle, CheckSquare2, Pin, Undo2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { NotificationItem } from "./NotificationItem";
import { NotificationSettings } from "./NotificationSettings";
import { UndoTimer } from "./UndoTimer";

interface LastOperation {
  ids: number[];
  originalStatus: 'read' | 'unread';
  timestamp: number;
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onMarkGroupAsRead: (group: string, ids: number[]) => void;
  onNotificationClick: (notification: Notification) => void;
  lastOperation: LastOperation | null;
  onUndo: () => void;
  onPin: (id: number) => void;
  onUnpin: (id: number) => void;
  showPlainView: boolean;
  onShowPlainViewChange: (value: boolean) => void;
  hideSeen: boolean;
  onHideSeenChange: (value: boolean) => void;
}

export const NotificationSidebar = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkGroupAsRead,
  onNotificationClick,
  lastOperation,
  onUndo,
  onPin,
  onUnpin,
  showPlainView,
  onShowPlainViewChange,
  hideSeen,
  onHideSeenChange,
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
        priorityFilter === "All Priorities" || 
        (priorityFilter === "Need high attention" && notification.priority === "high") ||
        (priorityFilter === "Moderate priority" && notification.priority === "medium") ||
        (priorityFilter === "Low" && notification.priority === "low");

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
    const filtered = filteredNotifications.filter((n) => n.status === "unread" && !n.pinned);
    const groups: Record<string, Notification[]> = {
      Mentions: [],
      "Assigned to Me": [],
      "Task Updates": [],
      Approval: [],
    };

    filtered.forEach((notification) => {
      groups[notification.group].push(notification);
    });

    // Sort by priority within each group (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    });

    return groups;
  }, [filteredNotifications]);

  const pinnedNotifications = useMemo(() => {
    const pinned = filteredNotifications.filter((n) => n.pinned);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return pinned.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [filteredNotifications]);

  const seenNotifications = useMemo(() => {
    const seen = filteredNotifications.filter((n) => n.status === "read" && !n.pinned);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return seen.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [filteredNotifications]);

  const plainViewNotifications = useMemo(() => {
    if (!showPlainView) return [];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const filtered = hideSeen 
      ? filteredNotifications.filter(n => n.status !== "read" || n.pinned)
      : filteredNotifications;
    return [...filtered].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [filteredNotifications, showPlainView, hideSeen]);

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
        <div className="border-b p-4 space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <NotificationSettings 
                showPlainView={showPlainView}
                onShowPlainViewChange={onShowPlainViewChange}
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Right: Filters */}
            <div className="flex items-center gap-2">
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[140px] h-8">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Time">All Time</SelectItem>
                          <SelectItem value="Today">Today</SelectItem>
                          <SelectItem value="This Week">This Week</SelectItem>
                          <SelectItem value="This Month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Priorities">All Priorities</SelectItem>
                          <SelectItem value="Need high attention">Need high attention</SelectItem>
                          <SelectItem value="Moderate priority">Moderate priority</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 pl-2 border-l">
                <Label htmlFor="hide-seen" className="text-xs cursor-pointer whitespace-nowrap">
                  Hide seen
                </Label>
                <Switch
                  id="hide-seen"
                  checked={hideSeen}
                  onCheckedChange={onHideSeenChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Groups */}
        <div className="flex-1 overflow-y-auto">
          {showPlainView ? (
            /* Plain View - Flat list sorted by priority */
            <div className="divide-y">
              {plainViewNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAsUnread={onMarkAsUnread}
                  onNotificationClick={onNotificationClick}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  isPinned={notification.pinned || false}
                  showPinButton={false}
                />
              ))}
              {plainViewNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Hooray! You've got no unseen notifications.</h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up. We'll notify you when something new arrives.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Grouped View */
            <>
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
                  onNotificationClick={onNotificationClick}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              )}

              {/* Show unread groups */}
              {["Approval", "Mentions", "Assigned to Me", "Task Updates"].map((groupName) => {
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
                    onNotificationClick={onNotificationClick}
                    onPin={onPin}
                    onUnpin={onUnpin}
                  />
                );
              })}
              
              {/* Show Seen group at the bottom */}
              {!hideSeen && seenNotifications.length > 0 && (
                <NotificationGroup
                  key="Seen"
                  groupName="Seen"
                  notifications={seenNotifications}
                  unreadCount={0}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAsUnread={onMarkAsUnread}
                  onMarkGroupAsRead={onMarkGroupAsRead}
                  onNotificationClick={onNotificationClick}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              )}

              {/* Empty state when all notifications are seen and hidden */}
              {hideSeen && pinnedNotifications.length === 0 && 
               Object.values(groupedNotifications).every(group => group.length === 0) && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Hooray! You've got no unseen notifications.</h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up. We'll notify you when something new arrives.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Undo Button */}
        {lastOperation && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-bottom-4">
            <Button
              onClick={onUndo}
              size="lg"
              className="shadow-lg gap-2 bg-primary hover:bg-primary/90"
            >
              <UndoTimer duration={3000} size={18} />
              Undo Mark as Read
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
