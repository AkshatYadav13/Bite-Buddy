import { Button } from '@/components/ui/button';
import { DialogContent,Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormEvent, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrderStore } from '@/store/useOrderStore';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

type CancelOrderDialogProps = {
    open:boolean,
    onOpenChange:(open:boolean)=> void
    cancelationReasons:string[]
    orderId:string
}

const CancelOrderDialog = ({open,onOpenChange,cancelationReasons,orderId}:CancelOrderDialogProps)=>{

    const {cancelOrder,loading} = useOrderStore()

    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");

    async function handleSubmit(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        const finalReason = selectedReason === "Other (please specify)" ? otherReason : selectedReason;
        await cancelOrder(orderId,finalReason)
        setSelectedReason("")
    };
    
    useEffect(()=>{
        setSelectedReason("")
    },[open])

    return(
    <Dialog open={open} onOpenChange={onOpenChange} >
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Cancel Your Order</DialogTitle>
            <DialogDescription>
                Please let us know why you're canceling. This helps us improve your experience in the future.
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <Label className='mb-3' > Select a reason:</Label>

                <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        { 
                            cancelationReasons.map((status, idx) => (
                            <SelectItem key={idx} value={status}>
                            {status}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>


                {selectedReason === "Other (please specify)" && (
                    <Input
                    type="text"
                    placeholder="Enter your reason"
                    className="my-5"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    required
                    />
                )}

                <div className="flex justify-end mt-8">
                    {loading.cancelOrderBtn ? (
                        <Button variant="destructive" className="w-full md:w-fit" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                            <span>Please wait</span>
                        </Button>
                    ) : (
                        <Button type="submit"  variant="destructive" className='w-full md:w-fit' >
                            Confirm
                        </Button>
                    )}
                </div>
            </form>
        </DialogContent>
    </Dialog>
    )
}

export default CancelOrderDialog