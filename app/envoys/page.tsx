// page.tsx (Server Component)

import { getAllEnvoys } from "@/lib/neo4j/person";
import EnvoysClient from "./client-page";

export default async function EnvoysPage() {
  // Fetch data server-side
  const envoys = await getAllEnvoys();

  return <EnvoysClient initialEnvoys={envoys} />;
}
