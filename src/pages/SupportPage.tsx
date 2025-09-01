import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, BookOpen } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">P2C Pulse Support</h1>
          <p className="text-xl text-muted-foreground">
            We're here to help you on your spiritual journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-muted-foreground mb-2">
                    For technical issues, feedback, or general inquiries
                  </p>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    support@p2cpulse.com
                  </Button>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Response Time</h4>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">How do I track my prayers?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Navigate to the Pray tab and tap the prayer time you want to track.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm">Can I customize my habits?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Yes! Go to the Habits tab to add, edit, or remove your spiritual habits.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm">Why aren't my notifications working?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check your device settings to ensure notifications are enabled for P2C Pulse.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">About P2C Pulse</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  P2C Pulse is designed to help you build and maintain consistent spiritual habits, 
                  track your prayer times, and grow in your faith journey.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Developer:</span>
                    <span>P2C Team</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Privacy & Terms</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Data Deletion Request
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Need More Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you can't find what you're looking for, don't hesitate to reach out to our support team.
          </p>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}