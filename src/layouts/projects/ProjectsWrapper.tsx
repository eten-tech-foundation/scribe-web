import React, { useEffect, useState } from 'react';

import { CreateProjectModal } from '@/components/CreateProjectModal';
import { ProjectsPage, type Project } from '@/layouts/projects';

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: 1,
    title: 'New Testament Translation - Luke',
    sourceLanguage: 'Greek',
    targetLanguage: 'Spanish',
    sourceBible: 'NA28 (Nestle-Aland 28th Edition)',
  },
  {
    id: 2,
    title: 'Old Testament - Genesis',
    sourceLanguage: 'Hebrew',
    targetLanguage: 'Portuguese',
    sourceBible: 'BHS (Biblia Hebraica Stuttgartensia)',
  },
  {
    id: 3,
    title: 'Psalms Translation Project',
    sourceLanguage: 'Hebrew',
    targetLanguage: 'French',
    sourceBible: 'WLC (Westminster Leningrad Codex)',
  },
  {
    id: 4,
    title: 'Gospel of John Study',
    sourceLanguage: 'Greek',
    targetLanguage: 'German',
    sourceBible: 'TR (Textus Receptus)',
  },
  {
    id: 5,
    title: 'Romans Commentary Translation',
    sourceLanguage: 'Greek',
    targetLanguage: 'Italian',
    sourceBible: 'NA28 (Nestle-Aland 28th Edition)',
  },
  {
    id: 6,
    title: 'Proverbs Wisdom Literature',
    sourceLanguage: 'Hebrew',
    targetLanguage: 'Dutch',
    sourceBible: 'BHS (Biblia Hebraica Stuttgartensia)',
  },
  {
    id: 7,
    title: 'Acts of the Apostles',
    sourceLanguage: 'Greek',
    targetLanguage: 'Russian',
    sourceBible: 'SBL (Society of Biblical Literature)',
  },
  {
    id: 8,
    title: 'Isaiah Prophetic Books',
    sourceLanguage: 'Hebrew',
    targetLanguage: 'Korean',
    sourceBible: 'WLC (Westminster Leningrad Codex)',
  },
  {
    id: 9,
    title: 'Matthew Gospel Translation',
    sourceLanguage: 'Greek',
    targetLanguage: 'Japanese',
    sourceBible: 'NA28 (Nestle-Aland 28th Edition)',
  },
  {
    id: 10,
    title: 'Ecclesiastes Wisdom Study',
    sourceLanguage: 'Hebrew',
    targetLanguage: 'Chinese (Simplified)',
    sourceBible: 'BHS (Biblia Hebraica Stuttgartensia)',
  },
  {
    id: 11,
    title: '1 Corinthians Pauline Letters',
    sourceLanguage: 'Greek',
    targetLanguage: 'Arabic',
    sourceBible: 'TR (Textus Receptus)',
  },
  {
    id: 12,
    title: 'Daniel Apocalyptic Literature',
    sourceLanguage: 'Hebrew/Aramaic',
    targetLanguage: 'Hindi',
    sourceBible: 'WLC (Westminster Leningrad Codex)',
  },
];

export const ProjectsWrapper: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  //    const createProjectMutation = useCreateProject();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProject = async (): Promise<void> => {
    try {
      // Add additional fields that might be needed

      closeModal();
    } catch (error) {}
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Simulate API call
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    // TODO: Implement create project functionality
    console.log('Create project clicked');
    // This would typically open a modal or navigate to a create project page
  };

  const handleEditProject = (project: Project) => {
    // TODO: Implement edit project functionality
    console.log('Edit project clicked:', project);
    // This would typically open a modal or navigate to an edit project page
  };

  return (
    <>
      <ProjectsPage
        loading={loading}
        projects={projects}
        onCreateProject={openCreateModal}
        onEditProject={handleEditProject}
      />
      <CreateProjectModal
        // isLoading={createProjectMutation.isPending}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProject}
      />
    </>
  );
};
