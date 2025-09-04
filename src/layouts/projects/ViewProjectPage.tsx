// // Path: src/layouts/projects/ViewProjectPage.tsx

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { ViewPageHeader } from '@/layouts/projects/ViewPageHeader';
// import { type Project } from '@/lib/types';

// interface ViewProjectPageProps {
//   project: Project;
// }

// export const ViewProjectPage: React.FC<ViewProjectPageProps> = ({ project }) => {
//   return (
//     <div className='flex h-full flex-col'>
//       {/* Header */}
//       <ViewPageHeader
//         backTo='/projects'
//         title={`${project.targetLanguageName} - ${project.name}`}
//       />

//       {/* Body */}
//       <div className='flex flex-1 gap-6 overflow-hidden'>
//         {/* Left Side: Project Details Card (1/3 width) */}
//         <aside className='w-full md:w-1/3'>
//           <Card>
//             <CardHeader>
//               <CardTitle>Project Details</CardTitle>
//               <CardDescription>Overview of the project configuration.</CardDescription>
//             </CardHeader>
//             <CardContent className='grid gap-4 text-sm'>
//               <div className='flex items-center justify-between'>
//                 <span className='text-muted-foreground'>Name</span>
//                 <span className='font-semibold'>{project.name}</span>
//               </div>
//               <Separator />
//               <div className='flex items-center justify-between'>
//                 <span className='text-muted-foreground'>Source Language</span>
//                 <span className='font-semibold'>{project.sourceLanguageName}</span>
//               </div>
//               <Separator />
//               <div className='flex items-center justify-between'>
//                 <span className='text-muted-foreground'>Target Language</span>
//                 <span className='font-semibold'>{project.targetLanguageName}</span>
//               </div>
//               <Separator />
//               <div className='flex items-center justify-between'>
//                 <span className='text-muted-foreground'>Source Bible</span>
//                 <span className='font-semibold'>{project.sourceName}</span>
//               </div>
//             </CardContent>
//           </Card>
//         </aside>

//         {/* Right Side: Vacated for Table (2/3 width) */}
//         <main className='hidden w-2/3 md:block'>
//           <div className='flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-gray-50/50'>
//             <span className='text-muted-foreground'>Table content goes here</span>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };
