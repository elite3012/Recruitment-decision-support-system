import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api/client';
import { useRecruiterStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import JobSelectionHeader from '../components/JobSelection/JobSelectionHeader';
import JobSelectionTable from '../components/JobSelection/JobSelectionTable';

const JobSelection = () => {
  const { setSelectedJobId } = useRecruiterStore();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  const handleSelectJob = (id: number) => {
    setSelectedJobId(id);
    navigate('/ranking');
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading jobs database...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load jobs. Ensure the backend server is running and accessible.</div>;

  return (
    <div className="space-y-6">
      <JobSelectionHeader />
      <JobSelectionTable data={data} handleSelectJob={handleSelectJob} />
    </div>
  );
};

export default JobSelection;