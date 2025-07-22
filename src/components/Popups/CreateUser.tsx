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
import logger from '@/lib/error-logger';
import { USER_ROLES } from '@/utils/constants';
import { rolesUtils } from '@/utils/rolesUtils';

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required.',
    })
    .email({
      message: 'Please enter a valid email address.',
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
  isLoading?: boolean;
}

export function UserForm({ isEdit = false, initialData, onSubmit, isLoading }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: initialData?.email ?? '',
      username: initialData?.username ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      role: initialData?.role ? rolesUtils.getRoleNameById(initialData.role) : '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values);
    } catch (error) {
      logger.error(error as Error, 'UserForm', 'handleSubmit', 'UserForm');
    }
  };

  return (
    <>
      <DialogHeader className='-m-6 mb-4 rounded-t-md bg-[#068bb3] p-4 text-white'>
        <DialogTitle className='text-lg font-medium'>
          {isEdit ? 'Edit User' : 'Add User'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className='text-gray-700 dark:text-gray-300'>
                  <span className='text-red-500'>*</span>Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='email@example.org'
                    {...field}
                    className={`focus-visible:ring-0 ${error ? '!border-red-500 focus:!border-red-500' : ''}`}
                    disabled={isEdit}
                  />
                </FormControl>
                {error && <FormMessage className='text-red-500'>{error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className='text-gray-700 dark:text-gray-300'>
                  <span className='text-red-500'>*</span>Display Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={`focus-visible:ring-0 ${error ? '!border-red-500 focus:!border-red-500' : ''}`}
                    placeholder='... eg. John'
                  />
                </FormControl>
                {error && <FormMessage className='text-red-500'>{error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-gray-700 dark:text-gray-300'>First Name</FormLabel>
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
                <FormLabel className='text-gray-700 dark:text-gray-300'>Last Name</FormLabel>
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
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className='text-gray-700 dark:text-gray-300'>
                  <span className='text-red-500'>*</span>Role
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger
                      className={`${error ? '!border-red-500 focus:!border-red-500' : ''}`}
                    >
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && <FormMessage className='text-red-500'>{error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <div className='flex justify-end pt-4'>
            <Button
              className='cursor-pointer bg-[#068bb3] px-6 text-white hover:bg-[#068bb3]'
              disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}
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
