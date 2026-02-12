import { useNavigate } from '@tanstack/react-router';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const SettingsModal: React.FC = ({}) => {
  const navigate = useNavigate();

  const isModalOpen = true;
  const handleClose = () => void navigate({ to: '/' });

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div>
          <ThemeToggle />
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
