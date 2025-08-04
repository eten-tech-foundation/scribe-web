import React, { useState } from 'react';

import { X } from 'lucide-react';

import { type User } from '@/data/mockUsers';

// EditUserModal Component
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'Team Member',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = () => {
    if (user && formData.displayName && formData.firstName) {
      onSave({ ...user, ...formData });
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='w-full max-w-md rounded-lg bg-white p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Edit User</h2>
          <button className='text-gray-500 hover:text-gray-700' onClick={onClose}>
            <X className='h-6 w-6' />
          </button>
        </div>
        <div>
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Email</label>
            <input
              required
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='email'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Display Name</label>
            <input
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='text'
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>First Name</label>
            <input
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='text'
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            />
            <label className='mb-2 block text-sm font-medium text-gray-700'>First Name</label>
            <input
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              type='text'
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Role</label>
            <select
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value='Team Member'>Team Member</option>
              <option value='Team Lead'>Team Lead</option>
              <option value='Organization Manager'>Organization Manager</option>
            </select>
          </div>

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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
