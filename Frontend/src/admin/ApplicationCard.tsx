import { useState } from 'react';
import { CheckCircle,  XCircle, MoreHorizontal, Trash2, Loader2} from 'lucide-react';
import { DialogContent,Dialog, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RestaurantAppCard from './RestaurantAppCard';
import DeliveryAgentAppCard from './DeliveryAgentAppCard';
import ConfirmBox from '@/components/shared/ConfirmBox';
import { Button } from '@/components/ui/button';
import { Menubar, MenubarTrigger, MenubarItem, MenubarMenu, MenubarContent,
} from "../components/ui/menubar";
import { DeliveryApplication, RestaurantApplication } from '@/types/applicationType';
import { useApplicationStore } from '@/store/useApplicationStore';

interface ApplicationCardProps {
  application: RestaurantApplication | DeliveryApplication;
  type: 'restaurant' | 'delivery';
  onStatusUpdate?: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void;
  showActions?: boolean;
}

const ApplicationCard = ({ application, type, onStatusUpdate, showActions = true, }:ApplicationCardProps) => {
  if (type === 'restaurant') {    
    return (
      <RestaurantAppCard
        restaurant={application as RestaurantApplication}
        onStatusUpdate={onStatusUpdate}
        showActions={showActions}
      />
    );
  }

  return (
    <DeliveryAgentAppCard
      agent={application as DeliveryApplication}
      onStatusUpdate={onStatusUpdate}
      showActions={showActions}
    />
  );
};

export default ApplicationCard;




type ActionBtnProps = {
    applicationId: string; 
    currentStatus: string; 
    onStatusUpdate?: (id: string, status: 'Approved' | 'Rejected', reason?: string)=> void
}

export const ActionButtons = ({ applicationId, currentStatus, onStatusUpdate }: ActionBtnProps) => {
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [reason, setReason] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const {deleteApplication,loading} = useApplicationStore()

  const handleStatusChange = (newStatus: 'Approved' | 'Rejected') => {
    setSelectedAction(newStatus);
    if (newStatus === 'Rejected') {
      setShowReasonDialog(true);
    } else if (newStatus === 'Approved') {
      setOpenConfirmDialog(true);
    }
  };

  const handleReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAction && onStatusUpdate && reason.trim()) {
      onStatusUpdate(applicationId, selectedAction, reason);
      setShowReasonDialog(false);
      setReason('');
      setSelectedAction(null);
    }
  };

  const confirmHandler = () => {
    if (selectedAction && onStatusUpdate) {
      onStatusUpdate(applicationId, selectedAction);
      setOpenConfirmDialog(false);
      setSelectedAction(null);
    }
  };

  return (
    <div className="relative">
      <Menubar className='bg-transparent border-none shadow-none'>
        <MenubarMenu>
          <MenubarTrigger className='bg-transparent'>
              <MoreHorizontal className="h-4 w-4" />
          </MenubarTrigger>
          <MenubarContent>
            {currentStatus === 'Pending' ? (
              <>
                <MenubarItem
                  onClick={() => handleStatusChange('Approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </MenubarItem>
                <MenubarItem
                  onClick={() => handleStatusChange('Rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </MenubarItem>
              </>
            ) : (
              <MenubarItem
                onClick={() => deleteApplication(applicationId)}
                disabled={loading.deleteAppBtn}
              >
                {
                  loading.deleteAppBtn ?
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  :
                  <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                  </>
                }
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Rejection Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
            <DialogDescription>
              Please provide a clear explanation for why this application is being rejected. 
              This reason will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReasonSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Select a reason:</Label>
              <Textarea
                id="reason"
                placeholder="Enter your reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReasonDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!reason.trim()} 
                variant="destructive"
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <ConfirmBox
        open={openConfirmDialog}
        onOpenChange={setOpenConfirmDialog}
        title="Approve Application"
        message="Are you sure you want to approve this application? This action cannot be undone."
        onConfirm={confirmHandler}
      />
    </div>
  );
};