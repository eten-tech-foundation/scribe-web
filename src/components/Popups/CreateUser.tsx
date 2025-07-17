import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  email: z.string().min(1, {
    message: 'Email is required.',
  }),
  username: z.string().min(1, {
    message: 'Username is required.',
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().min(1, {
    message: 'Role is required.',
  }),
});

interface UserFormProps {
  isEdit?: boolean;
  initialData?: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

export function UserForm({ isEdit = false, initialData, onSubmit }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || '',
      username: initialData?.username || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      role: initialData?.role || '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    await onSubmit(values);
    setIsLoading(false);
  };

  return (
    <>
      <DialogHeader className='-m-6 mb-4 bg-[#068bb3] p-4 text-white'>
        <DialogTitle className='text-lg font-medium'>
          {isEdit ? 'Edit User' : 'Add User'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='email@example.org'
                    {...field}
                    className='focus-visible:ring-0'
                    disabled={isEdit}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Display Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className='focus-visible:ring-0' placeholder='... eg. John' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} className='focus-visible:ring-0' placeholder='... eg. John' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} className='focus-visible:ring-0' placeholder='... eg. Doe' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Role <span className='text-red-500'>*</span>
                </FormLabel>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Translator'>Translator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end pt-4'>
            <Button
              className='cursor-pointer bg-[#068bb3] px-6 text-white hover:bg-[#068bb3]'
              disabled={isLoading}
              type='submit'
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save User' : 'Add User'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
