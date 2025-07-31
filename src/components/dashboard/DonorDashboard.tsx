import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, Package, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddFoodDialog } from "./AddFoodDialog";
import { FoodCard } from "./FoodCard";

interface FoodItem {
  id: string;
  food_name: string;
  food_type: string;
  cooked_time: string;
  expiry_time: string;
  pickup_location: string;
  image_url: string | null;
  claimed: boolean;
  claimed_by: string | null;
  created_at: string;
}

export function DonorDashboard() {
  const { profile, signOut } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('donor_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast({
        title: "Error",
        description: "Failed to load your food items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.user_id) {
      fetchFoodItems();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    // Set up real-time subscription for food items
    const channel = supabase
      .channel('food-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_items',
          filter: `donor_id=eq.${profile?.user_id}`
        },
        () => {
          fetchFoodItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "Your food item has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item",
        variant: "destructive"
      });
    }
  };

  const availableItems = foodItems.filter(item => !item.claimed);
  const claimedItems = foodItems.filter(item => item.claimed);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Donor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}!</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/90 backdrop-blur-glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{foodItems.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/90 backdrop-blur-glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Clock className="h-4 w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-foreground">{availableItems.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/90 backdrop-blur-glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{claimedItems.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Food Items Tabs */}
        <Card className="bg-card/90 backdrop-blur-glass border-border/50">
          <CardHeader>
            <CardTitle>Your Food Donations</CardTitle>
            <CardDescription>
              Manage your food donations and see their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="available" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="available">Available ({availableItems.length})</TabsTrigger>
                <TabsTrigger value="claimed">Claimed ({claimedItems.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available" className="mt-6">
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : availableItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No available food items</h3>
                    <p className="text-muted-foreground mb-4">
                      Start sharing food with your community!
                    </p>
                    <Button 
                      onClick={() => setShowAddDialog(true)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Food Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableItems.map((item) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteItem}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="claimed" className="mt-6">
                {claimedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No claimed items yet</h3>
                    <p className="text-muted-foreground">
                      Your donated food items will appear here once they're claimed
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {claimedItems.map((item) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AddFoodDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={() => {
            fetchFoodItems();
            setShowAddDialog(false);
          }}
        />
      </div>
    </div>
  );
}