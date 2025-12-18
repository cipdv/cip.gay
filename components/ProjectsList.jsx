const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const ProjectsList = ({ projects }) => {
  if (!projects?.length) {
    return <p className="mt-4">No projects yet.</p>;
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border border-black rounded-none p-3 bg-white/70"
        >
          <div className="font-bold break-words">{project.title}</div>
          {project.details && (
            <div className="text-sm break-words mt-1">{project.details}</div>
          )}
          <div className="text-xs text-gray-700 mt-2 flex gap-3">
            <span>Status: {project.status || "active"}</span>
            {project.created_at && (
              <span>Created: {formatDate(project.created_at)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsList;
