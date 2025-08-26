import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, Plus, Trash2, ExternalLink, Mic, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EchoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resources, setResources] = useState([
    { id: '1', title: 'Testimony Guidelines', url: 'https://example.com', description: 'How to share your story effectively' },
    { id: '2', title: 'Faith Sharing Tools', url: 'https://example.com', description: 'Resources for evangelism' }
  ]);
  
  const [newResource, setNewResource] = useState({ title: '', url: '', description: '' });
  
  const [trackingHistory] = useState([
    { date: '2024-01-26', completed: true, notes: 'Shared testimony with coworker about God\'s faithfulness' },
    { date: '2024-01-25', completed: true, notes: 'Posted encouraging scripture on social media' },
    { date: '2024-01-24', completed: false, notes: '' },
    { date: '2024-01-23', completed: true, notes: 'Talked about God\'s provision with friend' },
    { date: '2024-01-22', completed: true, notes: 'Family discussion about God\'s goodness' }
  ]);

  const addResource = () => {
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Missing information",
        description: "Please provide both title and URL for the resource.",
        variant: "destructive"
      });
      return;
    }

    const resource = {
      id: Date.now().toString(),
      ...newResource
    };

    setResources([...resources, resource]);
    setNewResource({ title: '', url: '', description: '' });
    
    toast({
      title: "Resource added",
      description: "Echo resource has been added successfully."
    });
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
    toast({
      title: "Resource removed",
      description: "Echo resource has been removed."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-orange)' }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="absolute top-6 left-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PULSE
          </Button>
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              ECHO
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              We experience and give voice to God's story
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* About This Habit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Echo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Echo is about experiencing God's goodness and giving voice to His story. As we share testimonies 
              of God's faithfulness, character, and work in our lives, we echo His truth into the world. 
              This habit helps us become storytellers of God's ongoing narrative.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Mic className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Give Voice</h3>
                <p className="text-sm text-muted-foreground">Share God's story</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Share className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Testimony</h3>
                <p className="text-sm text-muted-foreground">God's faithfulness</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-muted-foreground">Sharing tools and guides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Echo Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Resource */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add New Resource</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource-title">Title</Label>
                  <Input
                    id="resource-title"
                    placeholder="Resource title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="resource-url">URL</Label>
                  <Input
                    id="resource-url"
                    placeholder="https://..."
                    value={newResource.url}
                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="resource-description">Description (optional)</Label>
                <Input
                  id="resource-description"
                  placeholder="Brief description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                />
              </div>
              <Button onClick={addResource} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {/* Resource List */}
            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    )}
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center mt-1"
                    >
                      {resource.url} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(resource.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracking History */}
        <Card>
          <CardHeader>
            <CardTitle>Echo History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trackingHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${entry.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={entry.completed ? 'default' : 'secondary'}>
                    {entry.completed ? 'Completed' : 'Missed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EchoPage;