import WebsiteForm from "@/components/WebsiteForm";
import WebsitesList from "@/components/WebsitesList";
import { getWebsites, getWebsiteTasks } from "@/app/_actions";

const WebsitesPage = async () => {
  const websites = await getWebsites();
  const tasks = await getWebsiteTasks();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <WebsiteForm />
      <WebsitesList websites={websites || []} tasks={tasks || []} />
    </div>
  );
};

export default WebsitesPage;
