import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewJobClient } from "./NewJobClient";

export default async function NewJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <NewJobClient />;
}
