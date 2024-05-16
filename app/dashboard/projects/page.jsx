import ProjectsAddForm from "@/components/ProjectsAddForm";
import ProjectsList from "@/components/ProjectsList";
import React from "react";

const projectsPage = () => {
  return (
    <section>
      <ProjectsAddForm />
      <ProjectsList />
    </section>
  );
};

export default projectsPage;
