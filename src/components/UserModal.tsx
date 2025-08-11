import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Modal } from '@/components/ui/Modal';
import { roleOptions } from '@/lib/constants/roles';
import { type User } from '@/lib/types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (user: User | Omit<User, 'id'>) => Promise<void>;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  status: string;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  mode,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 0,
    status: 'invited',
  });

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    role: false,
  });

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        });
      } else {
        setFormData({
          username: '',
          firstName: '',
          lastName: '',
          email: '',
          role: 0,
          status: 'invited',
        });
      }
      setErrors({ username: false, email: false, role: false });
    }
  }, [isOpen, user, mode]);

  const validateForm = () => {
    const newErrors = {
      username: !formData.username.trim(),
      email: !formData.email.trim(),
      role: !formData.role || formData.role === 0,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'edit' && user) {
        await onSave({ ...user, ...formData });
      } else {
        await onSave(formData as Omit<User, 'id'>);
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in handleSubmit:', error);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const modalTitle = mode === 'create' ? t('addUser') : t('editProfile');
  const submitText = mode === 'create' ? t('addUser') : t('saveUser');

  return (
    <div className='text-gray-800'>
      <Modal isOpen={isOpen} title={modalTitle} onClose={onClose}>
        <div>
          <FormInput
            required
            error={errors.email}
            errorMessage='Email is required.'
            label={
              <>
                <span style={{ color: 'red' }}>*</span> {t('email')}
              </>
            }
            type='email'
            value={formData.email}
            onChange={value => updateFormData('email', value)}
          />

          <FormInput
            required
            error={errors.username}
            errorMessage='Username is required.'
            helperText='Visible to all Scribe users'
            label={
              <>
                <span style={{ color: 'red' }}>*</span> {t('username')}
              </>
            }
            value={formData.username}
            onChange={value => updateFormData('username', value)}
          />

          <FormInput
            label={t('firstName')}
            value={formData.firstName}
            onChange={value => updateFormData('firstName', value)}
          />

          <FormInput
            label={t('lastName')}
            value={formData.lastName}
            onChange={value => updateFormData('lastName', value)}
          />

          <FormSelect
            error={errors.role}
            errorMessage='Role is required.'
            label={
              <>
                <span style={{ color: 'red' }}>*</span> {t('role')}
              </>
            }
            options={roleOptions}
            placeholder={mode === 'create' ? 'Select Role' : undefined}
            value={formData.role.toString()}
            onChange={value => updateFormData('role', Number(value))}
          />

          <div className='my-7 flex justify-end gap-2'>
            <Button
              className='bg-primary hover:bg-primary/90 text-white hover:cursor-pointer'
              disabled={isLoading}
              type='button'
              onClick={handleSubmit}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
                </div>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
