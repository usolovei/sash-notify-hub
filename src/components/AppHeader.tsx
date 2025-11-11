import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  unreadCount: number;
  onBellClick: () => void;
}

export const AppHeader = ({ unreadCount, onBellClick }: AppHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Silpo Project</h1>
        <span className="text-sm text-muted-foreground">/ Shop 1</span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={onBellClick}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-badge text-badge-foreground text-xs font-medium flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </header>
  );
};
