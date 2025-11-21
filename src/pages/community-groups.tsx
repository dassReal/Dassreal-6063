import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Users, MapPin, Plus, Calendar, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";

const GROUP_TYPES = [
  "Innovation Lab",
  "Study Group",
  "Workshop Collective",
  "Research Team",
  "Maker Space",
  "Community Project",
  "Other",
];

export default function CommunityGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    state: "",
    country: "",
    groupType: "",
    meetingSchedule: "",
    maxMembers: "",
    contactEmail: "",
  });

  const { data: groupsData } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await apiClient.api.groups.$get();
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
  });

  const { data: myGroupsData } = useQuery({
    queryKey: ["my-groups"],
    queryFn: async () => {
      const res = await apiClient.api.groups.my.$get();
      if (!res.ok) throw new Error("Failed to fetch my groups");
      return res.json();
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.api.groups.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create group");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({
        title: "Success",
        description: "Community group created successfully!",
      });
      setFormData({
        name: "",
        description: "",
        location: "",
        city: "",
        state: "",
        country: "",
        groupType: "",
        meetingSchedule: "",
        maxMembers: "",
        contactEmail: "",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const res = await apiClient.api.groups[":id"].join.$post({
        param: { id: groupId },
      });
      if (!res.ok) throw new Error("Failed to join group");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({
        title: "Success",
        description: "You've joined the group!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
    };
    createGroupMutation.mutate(data);
  };

  const isGroupFull = (group: any) => {
    return group.maxMembers && group.currentMembers >= group.maxMembers;
  };

  const isMember = (groupId: string) => {
    return myGroupsData?.groups?.some((g: any) => g.id === groupId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Groups</h1>
          <p className="text-muted-foreground">
            Join local groups, collaborate with innovators, and build together
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>My Groups</CardTitle>
                <CardDescription>Groups you've joined</CardDescription>
              </CardHeader>
              <CardContent>
                {myGroupsData?.groups && myGroupsData.groups.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {myGroupsData.groups.map((group: any) => (
                      <div
                        key={group.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <h3 className="font-semibold mb-2">{group.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {group.city}, {group.country}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {group.currentMembers} members
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    You haven't joined any groups yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Groups</CardTitle>
                <CardDescription>Discover and join community groups</CardDescription>
              </CardHeader>
              <CardContent>
                {groupsData?.groups && groupsData.groups.length > 0 ? (
                  <div className="space-y-4">
                    {groupsData.groups.map((group: any) => (
                      <Card key={group.id} className="border hover:border-primary transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {group.description}
                              </p>
                              <div className="grid md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{group.city}, {group.country}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {group.currentMembers}
                                    {group.maxMembers ? ` / ${group.maxMembers}` : ""} members
                                  </span>
                                </div>
                                {group.meetingSchedule && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{group.meetingSchedule}</span>
                                  </div>
                                )}
                                {group.websiteUrl && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <a
                                      href={group.websiteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      Visit Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className="px-3 py-1 bg-secondary rounded-full text-xs">
                                {group.groupType}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => joinGroupMutation.mutate(group.id)}
                            disabled={
                              isGroupFull(group) ||
                              isMember(group.id) ||
                              joinGroupMutation.isPending
                            }
                            className="w-full"
                          >
                            {isMember(group.id)
                              ? "Already a Member"
                              : isGroupFull(group)
                              ? "Group Full"
                              : "Join Group"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No groups yet. Create the first one!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Group
                </CardTitle>
                <CardDescription>
                  Start a new community group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      placeholder="Innovation Lab NYC"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What's your group about?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Group Type</Label>
                    <Select
                      value={formData.groupType}
                      onValueChange={(value) => setFormData({ ...formData, groupType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUP_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="USA"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Address</Label>
                    <Input
                      placeholder="123 Main St, New York, NY"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Schedule (Optional)</Label>
                    <Input
                      placeholder="Every Tuesday 6pm"
                      value={formData.meetingSchedule}
                      onChange={(e) =>
                        setFormData({ ...formData, meetingSchedule: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Members (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Email (Optional)</Label>
                    <Input
                      type="email"
                      placeholder="contact@group.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.name ||
                      !formData.description ||
                      !formData.city ||
                      !formData.country ||
                      !formData.location ||
                      !formData.groupType ||
                      createGroupMutation.isPending
                    }
                    className="w-full"
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Group"
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
