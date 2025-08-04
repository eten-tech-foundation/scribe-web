import { useState } from 'react';

import { X } from 'lucide-react';

import { type User } from '@/data/mockUsers';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'Team Member',
    status: 'invited' as const,
  });

  const [errors, setErrors] = useState({
    displayName: false,
    email: false,
    role: false,
  });

  const handleSubmit = () => {
    const newErrors = {
      displayName: formData.displayName.trim() === '',
      email: formData.email.trim() === '',
      role: formData.role.trim() === '',
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      // Prevent submission
      return;
    }

    // Submit if no errors
    onSave(formData);
    setFormData({
      displayName: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'Team Member',
      status: 'invited',
    });
    setErrors({ displayName: false, email: false, role: false });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='w-full max-w-md rounded-lg bg-white p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Add New User</h2>
          <button className='text-gray-500 hover:text-gray-700' onClick={onClose}>
            <X className='h-6 w-6' />
          </button>
        </div>
        <div>
          {/* Email */}
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Email</label>
            <input
              className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              type='email'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className='mt-1 text-sm text-red-600'>Email is required.</p>}
          </div>

          {/* Display Name */}
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Display Name</label>
            <input
              className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                errors.displayName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              type='text'
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
            />
            {errors.displayName && (
              <p className='mt-1 text-sm text-red-600'>Display name is required.</p>
            )}
          </div>

          {/* First Name */}
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>First Name</label>
            <input
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='text'
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          {/* Last Name */}
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Last Name</label>
            <input
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='text'
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          {/* Role */}
          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Role</label>
            <select
              className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                errors.role
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value=''>Select Role</option>
              <option value='Team Member'>Team Member</option>
              <option value='Team Lead'>Team Lead</option>
              <option value='Organization Manager'>Organization Manager</option>
            </select>
            {errors.role && <p className='mt-1 text-sm text-red-600'>Role is required.</p>}
          </div>

          {/* Buttons */}
          <div className='flex justify-end space-x-3'>
            <button
              className='rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50'
              type='button'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className='rounded-md bg-[#007EA7] px-4 py-2 text-white hover:bg-blue-700'
              type='button'
              onClick={handleSubmit}
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
