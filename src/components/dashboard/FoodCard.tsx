import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

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

interface FoodCardProps {
  item: FoodItem;
  onClaim?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  showClaimButton?: boolean;
  showActions?: boolean;
}

const foodTypeColors = {
  'Vegetarian': 'bg-gradient-fresh text-white',
  'Non-Vegetarian': 'bg-gradient-warm text-white',
  'Packaged': 'bg-gradient-primary text-white'
};

const defaultFoodImages = {
  'Vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
  'Non-Vegetarian': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
  'Packaged': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop'
};

export function FoodCard({ 
  item, 
  onClaim, 
  onDelete, 
  showClaimButton = false, 
  showActions = false 
}: FoodCardProps) {
  const imageUrl = item.image_url || defaultFoodImages[item.food_type as keyof typeof defaultFoodImages];
  
  const isExpired = new Date(item.expiry_time) < new Date();
  const isExpiringSoon = new Date(item.expiry_time) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card className="bg-card/95 backdrop-blur-glass border-border/50 shadow-glass hover:shadow-glow transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={imageUrl}
          alt={item.food_name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultFoodImages[item.food_type as keyof typeof defaultFoodImages];
          }}
        />
        {item.claimed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Claimed
            </Badge>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={foodTypeColors[item.food_type as keyof typeof foodTypeColors]}>
            {item.food_type}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{item.food_name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1" />
          {item.pickup_location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cooked:</span>
            <span className="font-medium">
              {format(new Date(item.cooked_time), 'MMM dd, h:mm a')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expires:</span>
            <span className={`font-medium ${
              isExpired ? 'text-destructive' : 
              isExpiringSoon ? 'text-orange-500' : 
              'text-foreground'
            }`}>
              {format(new Date(item.expiry_time), 'MMM dd, h:mm a')}
            </span>
          </div>
          {isExpiringSoon && !isExpired && (
            <div className="flex items-center text-orange-500 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Expires soon!
            </div>
          )}
          {isExpired && (
            <div className="flex items-center text-destructive text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Expired
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          {showClaimButton && !item.claimed && !isExpired && (
            <Button
              onClick={() => onClaim?.(item.id)}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              Claim Food
            </Button>
          )}
          
          {showActions && !item.claimed && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(item.id)}
              className="ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          {item.claimed && (
            <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
              {showActions ? 'Claimed by someone' : 'Already claimed'}
            </div>
          )}
          
          {isExpired && (
            <div className="flex-1 text-center py-2 text-sm text-destructive font-medium">
              Expired
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}