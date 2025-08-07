// Common User Modal Component
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { Modal } from '@/components/ui/Modal';
import { type User } from '@/data/mockUsers';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (user: User | Omit<User, 'id'>) => void;
  mode: 'create' | 'edit';
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave, mode }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<{
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: 'invited' | 'verified';
  }>({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    status: 'invited',
  });

  const [errors, setErrors] = useState({
    displayName: false,
    email: false,
    role: false,
  });

  const roleOptions = [
    { value: 'Team Member', label: 'Team Member' },
    { value: 'Team Lead', label: 'Team Lead' },
    { value: 'Organization Manager', label: 'Organization Manager' },
  ];

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        });
      } else {
        setFormData({
          displayName: '',
          firstName: '',
          lastName: '',
          email: '',
          role: '',
          status: 'invited',
        });
      }
      setErrors({ displayName: false, email: false, role: false });
    }
  }, [isOpen, user, mode]);

  const validateForm = () => {
    const newErrors = {
      displayName: formData.displayName.trim() === '',
      email: formData.email.trim() === '',
      role: formData.role.trim() === '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (mode === 'edit' && user) {
      onSave({ ...user, ...formData });
    } else {
      onSave(formData);
    }

    onClose();
  };

  const updateFormData = (field: string, value: string) => {
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
            error={errors.displayName}
            errorMessage='Display name is required.'
            helperText='Visible to all Scribe users'
            label={
              <>
                <span style={{ color: 'red' }}>*</span> {t('displayName')}
              </>
            }
            value={formData.displayName}
            onChange={value => updateFormData('displayName', value)}
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
            value={formData.role}
            onChange={value => updateFormData('role', value)}
          />

          {/* <FormActions submitText={submitText} onSubmit={handleSubmit} /> */}
          <div className='my-7 flex justify-end'>
            <Button
              className='bg-primary hover:bg-primary/90 text-white hover:cursor-pointer'
              type='button'
              onClick={handleSubmit}
            >
              {submitText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
