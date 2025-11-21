import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";

export default function NftStudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prompt: "",
    monetizationTips: "",
    tags: "",
    generateImage: false,
  });

  const { data: nftsData } = useQuery({
    queryKey: ["nfts"],
    queryFn: async () => {
      const res = await apiClient.api.nfts.$get();
      if (!res.ok) throw new Error("Failed to fetch NFTs");
      return res.json();
    },
  });

  const createNftMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.api.nfts.$post({ json: data });
      if (!res.ok) throw new Error("Failed to create NFT");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
      toast({
        title: "Success",
        description: "NFT created successfully!",
      });
      setFormData({
        title: "",
        description: "",
        prompt: "",
        monetizationTips: "",
        tags: "",
        generateImage: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create NFT. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateTipsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.api.nfts["generate-tips"].$post({
        json: { title: formData.title, description: formData.description },
      });
      if (!res.ok) throw new Error("Failed to generate tips");
      return res.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, monetizationTips: data.tips }));
      toast({
        title: "Tips Generated",
        description: "AI-generated monetization tips added!",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNftMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NFT Studio</h1>
          <p className="text-muted-foreground">
            Create and manage your NFT collection with AI-powered tools
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New NFT
              </CardTitle>
              <CardDescription>
                Fill in the details and optionally use AI to generate images and tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="My Amazing NFT"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">AI Image Prompt (Optional)</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A futuristic cityscape at sunset with flying cars..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={3}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generate-image"
                      checked={formData.generateImage}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, generateImage: checked })
                      }
                    />
                    <Label htmlFor="generate-image" className="text-sm">
                      Generate image with AI
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monetization-tips">Monetization Tips</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateTipsMutation.mutate()}
                      disabled={!formData.title || !formData.description || generateTipsMutation.isPending}
                    >
                      {generateTipsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="monetization-tips"
                    placeholder="Tips for monetizing this NFT..."
                    value={formData.monetizationTips}
                    onChange={(e) =>
                      setFormData({ ...formData, monetizationTips: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="art, digital, futuristic"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createNftMutation.isPending}
                >
                  {createNftMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create NFT"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your NFTs</CardTitle>
                <CardDescription>
                  Browse and manage your NFT collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nftsData?.nfts && nftsData.nfts.length > 0 ? (
                  <div className="space-y-4">
                    {nftsData.nfts.slice(0, 5).map((nft: any) => (
                      <div
                        key={nft.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex gap-4">
                          <img
                            src={nft.imageUrl}
                            alt={nft.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{nft.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {nft.description}
                            </p>
                            {nft.tags && (
                              <div className="flex gap-2 mt-2">
                                {nft.tags.split(",").slice(0, 3).map((tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-1 bg-secondary rounded-full"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No NFTs yet. Create your first NFT!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
