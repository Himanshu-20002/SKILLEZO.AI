import { redirect } from 'next/navigation';

export default function ApplicationsPage() {
  redirect('/dashboard/job-center?tab=applied');
}
