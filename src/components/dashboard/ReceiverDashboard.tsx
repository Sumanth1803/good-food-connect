import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Search, Package, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  donor_id: string;
  created_at: string;
}

export function ReceiverDashboard() {
  const { profile, signOut } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('claimed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast({
        title: "Error",
        description: "Failed to load available food items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for food items
    const channel = supabase
      .channel('available-food-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_items'
        },
        () => {
          fetchFoodItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Filter food items based on search and filter criteria
    let filtered = foodItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(item => item.food_type === filterType);
    }

    setFilteredItems(filtered);
  }, [foodItems, searchTerm, filterType]);

  const handleClaimItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({
          claimed: true,
          claimed_by: profile?.user_id,
          claimed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Food claimed successfully!",
        description: "You can now contact the donor to arrange pickup.",
      });
    } catch (error) {
      console.error('Error claiming item:', error);
      toast({
        title: "Error",
        description: "Failed to claim the food item",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Available Food</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}!</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="bg-card/90 backdrop-blur-glass border-border/50 mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Available Food Items</CardTitle>
              <CardDescription>Find food donations in your community</CardDescription>
            </div>
            <Heart className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{filteredItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {foodItems.length} total items available
            </p>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="bg-card/90 backdrop-blur-glass border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Find Food</CardTitle>
            <CardDescription>
              Search for food by name or location, and filter by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by food name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="Packaged">Packaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Grid */}
        <Card className="bg-card/90 backdrop-blur-glass border-border/50">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || filterType !== "all" 
                    ? "No food items match your criteria" 
                    : "No food available right now"
                  }
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Check back later for new food donations"
                  }
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onClaim={handleClaimItem}
                    showClaimButton={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}