import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NotificationSettingsProps {
  showPlainView: boolean;
  onShowPlainViewChange: (value: boolean) => void;
  showPriorities: boolean;
  onShowPrioritiesChange: (value: boolean) => void;
}

export const NotificationSettings = ({
  showPlainView,
  onShowPlainViewChange,
  showPriorities,
  onShowPrioritiesChange,
}: NotificationSettingsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Customize your notification preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">View Mode</h4>
            <RadioGroup 
              value={showPlainView ? "plain" : "smart"} 
              onValueChange={(value) => onShowPlainViewChange(value === "plain")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="smart" id="smart-view" />
                <Label htmlFor="smart-view" className="cursor-pointer">Smart view</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plain" id="plain-view" />
                <Label htmlFor="plain-view" className="cursor-pointer">Plain view</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Display</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-priorities" className="flex flex-col gap-1">
                <span>Show priorities</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Display priority badges on notifications
                </span>
              </Label>
              <Switch 
                id="show-priorities" 
                checked={showPriorities}
                onCheckedChange={onShowPrioritiesChange}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-sm">General</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="flex flex-col gap-1">
                <span>Sound notifications</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Play sound for new notifications
                </span>
              </Label>
              <Switch id="sound" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="desktop" className="flex flex-col gap-1">
                <span>Desktop notifications</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Show desktop notifications
                </span>
              </Label>
              <Switch id="desktop" defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Notification Types</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="mentions" className="flex flex-col gap-1">
                <span>Mentions</span>
                <span className="font-normal text-xs text-muted-foreground">
                  When someone mentions you
                </span>
              </Label>
              <Switch id="mentions" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="assigned" className="flex flex-col gap-1">
                <span>Assignments</span>
                <span className="font-normal text-xs text-muted-foreground">
                  When tasks are assigned to you
                </span>
              </Label>
              <Switch id="assigned" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="updates" className="flex flex-col gap-1">
                <span>Task updates</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Updates on tasks you follow
                </span>
              </Label>
              <Switch id="updates" defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Auto-read Settings</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-read" className="flex flex-col gap-1">
                <span>Auto-mark as read</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Mark notifications as read when viewed
                </span>
              </Label>
              <Switch id="auto-read" defaultChecked />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
