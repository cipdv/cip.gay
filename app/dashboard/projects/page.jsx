import ProjectsAddForm from "@/components/ProjectsAddForm";
import ProjectsList from "@/components/ProjectsList";
import { getProjects, getTasks } from "@/app/_actions";
import React from "react";

const projectsPage = async () => {
  const projects = await getProjects();
  const tasks = await getTasks();

  return (
    <section className="px-10 py-8 space-y-6">
      <ProjectsAddForm />
      <ProjectsList projects={projects || []} tasks={tasks || []} />
    </section>
  );
};

export default projectsPage;
