import { RatingData } from '@/types/orderTypes';
import { Star,Loader2} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent,Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormEvent, useState } from 'react';
import { Label } from '@/components/ui/label';
import { useOrderStore } from '@/store/useOrderStore';
import { toast } from 'sonner';

interface OrderRatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId:string,
    restaurant: {
        id:string,
        name:string
    };
    deliveryAgent:{
        id:string,
        name:string
    }
    dishes?: {
        id: string;
        name: string;
    }[];
}

const OrderRatingDialog = ({ open, onOpenChange,orderId,restaurant,dishes = [],deliveryAgent}: OrderRatingDialogProps) => {

    const {setOrderRating,loading} = useOrderStore()

    const [ratings, setRatings] = useState<RatingInp>({
        restaurantRating: 0,
        dishRatings: {},
        deliveryAgentRating: 0,
    });

    const handleRatingChange = (type: 'restaurantRating' | 'deliveryAgentRating', value: number) => {
        setRatings(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleDishRatingChange = (dishId: string, value: number) => {
        setRatings(prev => ({
            ...prev,
            dishRatings: {
                ...prev.dishRatings,
                [dishId]: value
            }
        }));
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const hasDishRatings = Object.values(ratings.dishRatings).some(rating => rating > 0);
        
        if (ratings.restaurantRating === 0 || !hasDishRatings || ratings.deliveryAgentRating === 0) {
            toast.info("Please fill entire rating form before submitting..");
            return;
        }
        let ratingData = {} as RatingData;

        if (ratings.restaurantRating !== 0) {
            ratingData.restaurantRating = { [restaurant?.id!]: ratings.restaurantRating };
        }
        if (ratings.deliveryAgentRating !== 0) {
            ratingData.deliveryAgentRating = { [deliveryAgent?.id!]: ratings.deliveryAgentRating };
        }
        if (hasDishRatings) {
            ratingData.dishRatings = ratings?.dishRatings;
        }

        const isSuccess = await setOrderRating(orderId,ratingData)
        if(isSuccess){
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Order</DialogTitle>
                    <DialogDescription>
                        Help us improve by rating your experience. Your feedback matters!
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6  sm:grid grid-cols-2 gap-x-10 max-h-100 overflow-y-scroll  my-scrollbar">
                        <StarRating
                            rating={ratings.restaurantRating}
                            onRatingChange={(rating) => handleRatingChange('restaurantRating', rating)}
                            label={`${restaurant?.name ? `Rate ${restaurant.name}`:"Rate Restaurant"}`}
                        />

                        <StarRating
                            rating={ratings.deliveryAgentRating}
                            onRatingChange={(rating) => handleRatingChange('deliveryAgentRating', rating)}
                            label={`${deliveryAgent?.name ? `Rate ${deliveryAgent.name}`:"Rate Delivery Agent"}`}
                        />
                        
                        {dishes.map((dish) => (
                            <StarRating
                                key={dish.id}
                                rating={ratings.dishRatings[dish.id] || 0}
                                onRatingChange={(rating) => handleDishRatingChange(dish.id, rating)}
                                label={`Rate ${dish.name}`}
                            />
                        ))}
                        
                    </div>

                    <div className="flex justify-end pt-4">
                        {loading.setOrderRatingBtn ? (
                            <Button disabled className="w-full md:w-fit my-gradient-btn">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                                <span>Submitting...</span>
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full md:w-fit my-gradient-btn">
                                Submit Rating
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderRatingDialog



interface RatingInp {
    restaurantRating: number;
    dishRatings: { [dishId: string]: number };
    deliveryAgentRating: number;
}

const StarRating = ({ rating, onRatingChange, label }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
}) => {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                    >
                        <Star
                            className={`h-8 w-8 transition-colors ${
                                star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-400'
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};
