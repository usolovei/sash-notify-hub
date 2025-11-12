import { Button } from "@/components/ui/button";
import { Notification } from "@/data/notifications";
import { CheckSquare, Users, Headphones, Book, MessageSquare, X, Undo2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingOperation {
  ids: number[];
  timer: NodeJS.Timeout;
  type: 'individual' | 'group' | 'detail';
  group?: string;
}

interface NotificationDetailProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onAnswer?: (notificationId: number) => void;
  pendingOperations: Map<string, PendingOperation>;
  onUndoPendingOperation: (key: string) => void;
}

const moduleIcons = {
  Tasks: CheckSquare,
  "CRM Requests": Users,
  "Care Service": Headphones,
  "Knowledge Base": Book,
};

export const NotificationDetail = ({
  notification,
  isOpen,
  onClose,
  onAnswer,
  pendingOperations,
  onUndoPendingOperation,
}: NotificationDetailProps) => {
  if (!notification) return null;

  const ModuleIcon = moduleIcons[notification.module];
  const detailOpKey = `detail-${notification.id}`;
  const hasPendingOperation = pendingOperations.has(detailOpKey);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAnswer = () => {
    if (onAnswer) {
      onAnswer(notification.id);
      onClose();
    }
  };

  const isFromMentions = notification.originalGroup === "Mentions" || notification.group === "Mentions" || notification.group === "Unanswered";

  const handleUndoMarkAsRead = () => {
    onUndoPendingOperation(detailOpKey);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Detail Card */}
      <div
        className={`fixed top-0 left-0 h-full bg-background shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ right: 'calc(500px + 0.5rem)' }}
      >
        <Card className="h-full border-0 rounded-none flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>Notification Details</CardTitle>
              <div className="flex items-center gap-2">
                {hasPendingOperation && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleUndoMarkAsRead}
                    className="gap-1"
                  >
                    <Undo2 className="h-4 w-4" />
                    Keep Unread
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              View the full details of this notification
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pt-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getInitials(notification.name)}
                    </AvatarFallback>
                  </Avatar>
                  {ModuleIcon && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                      <ModuleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {notification.module}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.timestamp}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Subject</h4>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Message</h4>
                  <div className="rounded-lg border p-4 bg-muted/30">
                    <p className="text-sm">
                      This is an example notification detail. In a real application,
                      this would contain the full message content, any attachments,
                      and relevant contextual information about the task, mention,
                      or update.
                    </p>
                    <p className="text-sm mt-3">
                      You could include action buttons here to respond, complete
                      tasks, or navigate to the related content.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Related To</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ModuleIcon className="h-4 w-4" />
                    <span>{notification.module}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.group}</span>
                  </div>
                </div>

                {/* Answer Button for Mentions */}
                {isFromMentions && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleAnswer}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Answer
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Clicking Answer will mark this as read and move to Seen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
