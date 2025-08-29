import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageCircle, Plus, Trash2, ExternalLink, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits, ResourceItem } from "@/hooks/useHabits";
import { useAuth } from "@/hooks/useAuth";
import { PrayerManager } from "@/components/PrayerManager";
const PrayPage = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    habitData,
    loading,
    updateResources,
    updatePrayerList
  } = useHabits('pray');
  const [showPrayerManager, setShowPrayerManager] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    description: ''
  });

  // Use data from database or fallback to defaults
  const resources = habitData.resources || [{
    id: '1',
    title: 'Prayer Guide',
    url: 'https://example.com',
    description: 'A comprehensive guide to prayer'
  }, {
    id: '2',
    title: 'Daily Prayer Schedule',
    url: 'https://example.com',
    description: 'Structured prayer times'
  }];
  const trackingHistory = habitData.trackingHistory || [{
    date: '2024-01-26',
    completed: true,
    notes: 'Prayed for John, Sarah, Mike'
  }, {
    date: '2024-01-25',
    completed: true,
    notes: 'Morning prayer session'
  }, {
    date: '2024-01-24',
    completed: false,
    notes: ''
  }, {
    date: '2024-01-23',
    completed: true,
    notes: 'Prayer walk'
  }, {
    date: '2024-01-22',
    completed: true,
    notes: 'Group prayer meeting'
  }];
  const addResource = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save resources.",
        variant: "destructive"
      });
      return;
    }
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Missing information",
        description: "Please provide both title and URL for the resource.",
        variant: "destructive"
      });
      return;
    }
    const resource: ResourceItem = {
      id: Date.now().toString(),
      ...newResource
    };
    updateResources([...resources, resource]);
    setNewResource({
      title: '',
      url: '',
      description: ''
    });
    toast({
      title: "Resource added",
      description: "Prayer resource has been added successfully."
    });
  };
  const removeResource = (id: string) => {
    updateResources(resources.filter(r => r.id !== id));
    toast({
      title: "Resource removed",
      description: "Prayer resource has been removed."
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading prayer data...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{
      background: 'var(--gradient-yellow)'
    }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <Button onClick={() => navigate('/')} variant="ghost" className="absolute top-6 left-6 text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PULSE
          </Button>
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              PRAY
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              We seek God first, partnering with him in prayer
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* About This Habit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Prayer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">Prayer is our primary way of seeking God first in all things. 
By prioritizing praying for others, we align our hearts with God's heart for people. Commit to praying each week or day for a few friends. If you're looking for suggestions how to pray, check out the resources below.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="font-semibold">My Prayer List</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrayerManager(true)}
                    className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {habitData.prayerList && habitData.prayerList.length > 0 
                    ? habitData.prayerList.map(person => person.name).join(', ')
                    : "Click + to add people to pray for"
                  }
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-muted-foreground">Tools and guides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prayer Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Resource */}
            

            {/* Resource List */}
            <div className="space-y-3">
              {resources.map(resource => <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{resource.title}</h4>
                    {resource.description && <p className="text-sm text-muted-foreground">{resource.description}</p>}
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center mt-1">
                      {resource.url} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeResource(resource.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Tracking History */}
        <Card>
          <CardHeader>
            <CardTitle>Prayer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trackingHistory.map((entry, index) => <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${entry.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                      {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                    </div>
                  </div>
                  <Badge variant={entry.completed ? 'default' : 'secondary'}>
                    {entry.completed ? 'Completed' : 'Missed'}
                  </Badge>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Manager Dialog */}
      <Dialog open={showPrayerManager} onOpenChange={setShowPrayerManager}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prayer List Manager</DialogTitle>
          </DialogHeader>
          <PrayerManager prayerList={habitData.prayerList || []} onUpdatePrayerList={updatePrayerList} onClose={() => setShowPrayerManager(false)} />
        </DialogContent>
      </Dialog>
    </div>;
};
export default PrayPage;