import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFoodDialog({ open, onOpenChange, onSuccess }: AddFoodDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    food_name: "",
    food_type: "",
    pickup_location: "",
    cooked_time: "",
    expiry_time: "",
    image_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.user_id) return;
    
    setIsLoading(true);

    try {
      // Validate dates
      const cookedTime = new Date(formData.cooked_time);
      const expiryTime = new Date(formData.expiry_time);
      const now = new Date();

      if (cookedTime > now) {
        throw new Error("Cooked time cannot be in the future");
      }

      if (expiryTime <= now) {
        throw new Error("Expiry time must be in the future");
      }

      if (expiryTime <= cookedTime) {
        throw new Error("Expiry time must be after cooked time");
      }

      const { error } = await supabase
        .from('food_items')
        .insert({
          donor_id: profile.user_id,
          food_name: formData.food_name,
          food_type: formData.food_type,
          pickup_location: formData.pickup_location,
          cooked_time: formData.cooked_time,
          expiry_time: formData.expiry_time,
          image_url: formData.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Food item added!",
        description: "Your food donation has been posted successfully.",
      });

      // Reset form
      setFormData({
        food_name: "",
        food_type: "",
        pickup_location: "",
        cooked_time: "",
        expiry_time: "",
        image_url: ""
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding food item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add food item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate default datetime values
  const now = new Date();
  const defaultCookedTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  const defaultExpiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const formatDateTimeLocal = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Food Donation</DialogTitle>
          <DialogDescription>
            Share your food with the community. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="food_name">Food Name *</Label>
            <Input
              id="food_name"
              placeholder="e.g., Homemade Biryani, Fresh Vegetables"
              value={formData.food_name}
              onChange={(e) => handleChange('food_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="food_type">Food Type *</Label>
            <Select value={formData.food_type} onValueChange={(value) => handleChange('food_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select food type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Packaged">Packaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_location">Pickup Location *</Label>
            <Input
              id="pickup_location"
              placeholder="e.g., 123 Main Street, Downtown"
              value={formData.pickup_location}
              onChange={(e) => handleChange('pickup_location', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooked_time">Cooked Time *</Label>
              <Input
                id="cooked_time"
                type="datetime-local"
                value={formData.cooked_time || formatDateTimeLocal(defaultCookedTime)}
                onChange={(e) => handleChange('cooked_time', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_time">Expires At *</Label>
              <Input
                id="expiry_time"
                type="datetime-local"
                value={formData.expiry_time || formatDateTimeLocal(defaultExpiryTime)}
                onChange={(e) => handleChange('expiry_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Food Image URL (optional)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/food-image.jpg"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a default image based on food type
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Food Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}