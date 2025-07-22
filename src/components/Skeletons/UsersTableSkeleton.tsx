import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

export function UsersTableSkeleton() {
  const skeletonConfig = [
    { key: 'name', width: 'w-32' },
    { key: 'role', width: 'w-20' },
    { key: 'email', width: 'w-48' },
    { key: 'status', width: 'w-20', isRounded: true },
  ];

  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {skeletonConfig.map(skeleton => (
            <TableCell key={skeleton.key}>
              <Skeleton
                className={`h-5 ${skeleton.width} ${skeleton.isRounded ? 'rounded-full' : ''} dark:bg-gray-700`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
