import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap, MapPin, Calendar, Users, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];

export default function Workshops() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterSkillLevel, setFilterSkillLevel] = useState("");
  const [filterUpcoming, setFilterUpcoming] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    maxAttendees: "",
    skillLevel: "beginner",
    tags: "",
  });

  const { data: workshopsData } = useQuery({
    queryKey: ["workshops", filterSkillLevel, filterUpcoming],
    queryFn: async () => {
      const params: any = {};
      if (filterSkillLevel) params.skillLevel = filterSkillLevel;
      if (filterUpcoming) params.upcoming = "true";
      const res = await apiClient.api.workshops.$get({ query: params });
      if (!res.ok) throw new Error("Failed to fetch workshops");
      return res.json();
    },
  });

  const { data: myWorkshopsData } = useQuery({
    queryKey: ["my-workshops"],
    queryFn: async () => {
      const res = await apiClient.api.workshops.my.$get();
      if (!res.ok) throw new Error("Failed to fetch my workshops");
      return res.json();
    },
  });

  const createWorkshopMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.api.workshops.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create workshop");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast({
        title: "Success",
        description: "Workshop created successfully!",
      });
      setFormData({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        maxAttendees: "",
        skillLevel: "beginner",
        tags: "",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (workshopId: string) => {
      const res = await apiClient.api.workshops[":id"].register.$post({
        param: { id: workshopId },
      });
      if (!res.ok) throw new Error("Failed to register");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      queryClient.invalidateQueries({ queryKey: ["my-workshops"] });
      toast({
        title: "Success",
        description: "You're registered for the workshop!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
    };
    createWorkshopMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isWorkshopFull = (workshop: any) => {
    return workshop.maxAttendees && workshop.currentAttendees >= workshop.maxAttendees;
  };

  const isRegistered = (workshopId: string) => {
    return myWorkshopsData?.workshops?.some((w: any) => w.id === workshopId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workshops</h1>
          <p className="text-muted-foreground">
            Discover and join hands-on learning experiences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter workshops by skill level and timing</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterSkillLevel("");
                      setFilterUpcoming(true);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Select value={filterSkillLevel} onValueChange={setFilterSkillLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timing</Label>
                    <Select
                      value={filterUpcoming ? "upcoming" : "all"}
                      onValueChange={(value) => setFilterUpcoming(value === "upcoming")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {workshopsData?.workshops && workshopsData.workshops.length > 0 ? (
                workshopsData.workshops.map((workshop: any) => (
                  <Card key={workshop.id} className="hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">{workshop.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {workshop.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            workshop.skillLevel === "beginner"
                              ? "bg-green-500/10 text-green-500"
                              : workshop.skillLevel === "intermediate"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {workshop.skillLevel}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{workshop.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(workshop.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {workshop.currentAttendees}
                            {workshop.maxAttendees ? ` / ${workshop.maxAttendees}` : ""} registered
                          </span>
                        </div>
                        {workshop.endDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Ends {formatDate(workshop.endDate)}</span>
                          </div>
                        )}
                      </div>

                      {workshop.tags && (
                        <div className="flex gap-2 mb-4">
                          {workshop.tags.split(",").map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-secondary rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => registerMutation.mutate(workshop.id)}
                        disabled={
                          isWorkshopFull(workshop) ||
                          isRegistered(workshop.id) ||
                          registerMutation.isPending
                        }
                        className="w-full"
                      >
                        {isRegistered(workshop.id)
                          ? "Already Registered"
                          : isWorkshopFull(workshop)
                          ? "Workshop Full"
                          : "Register for Workshop"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                      No workshops found. Create the first one!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Workshops</CardTitle>
                <CardDescription>Workshops you're registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {myWorkshopsData?.workshops && myWorkshopsData.workshops.length > 0 ? (
                  <div className="space-y-3">
                    {myWorkshopsData.workshops.slice(0, 5).map((workshop: any) => (
                      <div
                        key={workshop.id}
                        className="border rounded-lg p-3 hover:border-primary transition-colors"
                      >
                        <h4 className="font-semibold text-sm mb-1">{workshop.title}</h4>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(workshop.startDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No workshops yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Workshop
                </CardTitle>
                <CardDescription>
                  Organize a new workshop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Workshop title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What will participants learn?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Address or online link"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date & Time (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Select
                      value={formData.skillLevel}
                      onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Attendees (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      placeholder="coding, AI, robotics"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.title ||
                      !formData.description ||
                      !formData.location ||
                      !formData.startDate ||
                      createWorkshopMutation.isPending
                    }
                    className="w-full"
                  >
                    {createWorkshopMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workshop"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
