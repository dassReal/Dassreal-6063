import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ThumbsUp, ThumbsDown, DollarSign, Lightbulb, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";

const FIELD_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Environment",
  "Social Impact",
  "Arts & Culture",
  "Business",
  "Science",
  "Other",
];

export default function InnovationHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionMessage, setContributionMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fieldCategory: "",
    fundingGoal: "",
  });

  const { data: ideasData } = useQuery({
    queryKey: ["ideas", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? { fieldCategory: selectedCategory } : undefined;
      const res = await apiClient.api.ideas.$get({ query: params as any });
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return res.json();
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.api.ideas.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create idea");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast({
        title: "Success",
        description: "Idea submitted successfully!",
      });
      setFormData({ title: "", description: "", fieldCategory: "", fundingGoal: "" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ ideaId, value }: { ideaId: string; value: number }) => {
      const res = await apiClient.api.ideas[":id"].vote.$post({
        param: { id: ideaId },
        json: { value },
      });
      if (!res.ok) throw new Error("Failed to vote");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
    },
  });

  const contributeMutation = useMutation({
    mutationFn: async ({ ideaId, amount, message }: any) => {
      const res = await apiClient.api.ideas[":id"].contribute.$post({
        param: { id: ideaId },
        json: { amount, message },
      });
      if (!res.ok) throw new Error("Failed to contribute");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast({
        title: "Contribution successful",
        description: "Thank you for supporting this idea!",
      });
      setContributionAmount("");
      setContributionMessage("");
      setSelectedIdea(null);
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      fundingGoal: formData.fundingGoal ? parseInt(formData.fundingGoal) : 0,
    };
    createIdeaMutation.mutate(data);
  };

  const handleContribute = () => {
    if (selectedIdea && contributionAmount) {
      contributeMutation.mutate({
        ideaId: selectedIdea.id,
        amount: parseInt(contributionAmount),
        message: contributionMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Innovation Hub</h1>
          <p className="text-muted-foreground">
            Share your ideas, vote on innovations, and support projects through crowdfunding
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className="h-auto py-4"
          >
            All Ideas
          </Button>
          {FIELD_CATEGORIES.slice(0, 3).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="h-auto py-4"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {ideasData?.ideas && ideasData.ideas.length > 0 ? (
              ideasData.ideas.map((idea: any) => (
                <Card key={idea.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {idea.description}
                        </CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-secondary rounded-full text-xs">
                        {idea.fieldCategory}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => voteMutation.mutate({ ideaId: idea.id, value: 1 })}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold">{idea.voteCount || 0}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => voteMutation.mutate({ ideaId: idea.id, value: -1 })}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>

                        {idea.fundingGoal > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setSelectedIdea(idea)}
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Support
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Support this Idea</DialogTitle>
                                <DialogDescription>
                                  Contribute to help bring this idea to life
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Amount ($)</Label>
                                  <Input
                                    type="number"
                                    placeholder="50"
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Message (Optional)</Label>
                                  <Textarea
                                    placeholder="Words of encouragement..."
                                    value={contributionMessage}
                                    onChange={(e) => setContributionMessage(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  onClick={handleContribute}
                                  disabled={!contributionAmount || contributeMutation.isPending}
                                  className="w-full"
                                >
                                  {contributeMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Contribute"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {idea.fundingGoal > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Funding Progress</span>
                            <span className="font-semibold">
                              ${idea.fundingRaised} / ${idea.fundingGoal}
                            </span>
                          </div>
                          <Progress
                            value={(idea.fundingRaised / idea.fundingGoal) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No ideas yet. Be the first to share your innovation!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit Your Idea
                </CardTitle>
                <CardDescription>
                  Share your innovation with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Your innovative idea..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your idea in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.fieldCategory}
                      onValueChange={(value) => setFormData({ ...formData, fieldCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Funding Goal (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={formData.fundingGoal}
                      onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.title ||
                      !formData.description ||
                      !formData.fieldCategory ||
                      createIdeaMutation.isPending
                    }
                    className="w-full"
                  >
                    {createIdeaMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Idea"
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
