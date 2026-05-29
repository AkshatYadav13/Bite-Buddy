import { Dialog,DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"

type ConfirmBoxProps = {
    open:boolean,
    onOpenChange:(open:boolean)=> void
    title?:string 
    message?:string 
    confirmText?:string
    cancelText?:string
    onConfirm:()=> void
    onCancel?:()=> void
}

const ConfirmBox = ({
    open,
    onOpenChange,
    title = "Are you sure?",
    message = "Do you want to proceed with this action?",
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmBoxProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm" >{message}</p>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={()=>{
                        onOpenChange(false)
                        onCancel?.()
                    }}
                >   
                    {cancelText}
                </Button>
                <Button
                    className="my-gradient-btn"
                    onClick={()=>{
                        onOpenChange(false)
                        onConfirm()
                    }}
                >   
                    {confirmText}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default ConfirmBox