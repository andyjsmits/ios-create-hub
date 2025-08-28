import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Shield, CheckCircle, XCircle } from "lucide-react";

export const NotificationsTest = () => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      toast({
        title: granted ? "Permissions Granted!" : "Permissions Denied",
        description: granted 
          ? "You can now receive notifications" 
          : "Notifications won't work without permissions",
        variant: granted ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleTestNotification = async () => {
    setIsLoading(true);
    try {
      const scheduleTime = new Date(Date.now() + 5000); // 5 seconds from now
      await notificationService.scheduleLocalNotification({
        title: "PULSE Test Notification",
        body: "This is a test notification from your PULSE app!",
        id: 999,
        schedule: scheduleTime
      });

      toast({
        title: "Notification Scheduled",
        description: "You should receive a test notification in 5 seconds",
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      toast({
        title: "Scheduling Failed",
        description: "Could not schedule the test notification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupPushNotifications = async () => {
    setIsLoading(true);
    try {
      await notificationService.setupPushNotifications();
      
      toast({
        title: "Push Setup Complete",
        description: "Check console for APNs token details",
      });
    } catch (error) {
      console.error('Push setup failed:', error);
      toast({
        title: "Push Setup Failed",
        description: "Could not set up push notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Denied</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Test
        </CardTitle>
        <CardDescription>
          Test notification functionality for iOS development
        </CardDescription>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Permission Status:</span>
          {getPermissionBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={requestPermissions}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Shield className="h-4 w-4 mr-2" />
          {isLoading ? "Requesting..." : "Request Notification Permissions"}
        </Button>

        <Button 
          onClick={scheduleTestNotification}
          disabled={isLoading || permissionStatus === 'denied'}
          className="w-full"
        >
          <Bell className="h-4 w-4 mr-2" />
          {isLoading ? "Scheduling..." : "Schedule Local Notification (5s)"}
        </Button>

        <Button 
          onClick={setupPushNotifications}
          disabled={isLoading || permissionStatus === 'denied'}
          className="w-full"
          variant="secondary"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? "Setting up..." : "Setup Push Notifications"}
        </Button>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
          <p><strong>Instructions:</strong></p>
          <p>1. First request permissions (required on iOS)</p>
          <p>2. Test local notifications with the 5-second timer</p>
          <p>3. Setup push notifications to get APNs token in console</p>
          <p>4. Check Xcode console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
};