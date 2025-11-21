import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Beaker, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";

export default function MaterialScience() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [aiTopic, setAiTopic] = useState("");
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["material-categories"],
    queryFn: async () => {
      const res = await apiClient.api.materials.categories.$get();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: itemsData } = useQuery({
    queryKey: ["material-items", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? { categoryId: selectedCategory } : undefined;
      const res = await apiClient.api.materials.items.$get({ query: params as any });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.api.materials.items.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-items"] });
      toast({
        title: "Success",
        description: "Material science item submitted successfully!",
      });
      setFormData({ categoryId: "", title: "", description: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const aiAssistMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await apiClient.api.materials["ai-assist"].$post({
        json: { topic, categoryId: formData.categoryId },
      });
      if (!res.ok) throw new Error("Failed to get AI assistance");
      return res.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        title: data.suggestion.title,
        description: data.suggestion.description,
      }));
      toast({
        title: "AI Suggestion Generated",
        description: "Review and edit the generated content before submitting.",
      });
    },
  });

  const handleAiAssist = () => {
    if (aiTopic && formData.categoryId) {
      aiAssistMutation.mutate(aiTopic);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Material Science Directory</h1>
          <p className="text-muted-foreground">
            Explore and contribute to our collaborative material science knowledge base
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {categoriesData?.categories?.map((category: any) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id
                  ? "border-primary shadow-lg"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5" />
                  {category.name}
                </CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedCategory ? "Category Items" : "All Items"}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory("")}
                    disabled={!selectedCategory}
                  >
                    Show All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {itemsData?.items && itemsData.items.length > 0 ? (
                  <div className="space-y-4">
                    {itemsData.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              item.status === "approved"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.aiGenerated && (
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full">
                              AI-Assisted
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items found. Be the first to contribute!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit Item
                </CardTitle>
                <CardDescription>
                  Add new material science information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!formData.categoryId}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Assistance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>AI Material Science Assistant</DialogTitle>
                        <DialogDescription>
                          Enter a topic and let AI help you create a submission
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="e.g., Graphene applications"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                        />
                        <Button
                          onClick={handleAiAssist}
                          disabled={!aiTopic || aiAssistMutation.isPending}
                          className="w-full"
                        >
                          {aiAssistMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Generate Suggestion"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Material or concept name"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Detailed description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={() => createItemMutation.mutate(formData)}
                    disabled={
                      !formData.categoryId ||
                      !formData.title ||
                      !formData.description ||
                      createItemMutation.isPending
                    }
                    className="w-full"
                  >
                    {createItemMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Item"
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
