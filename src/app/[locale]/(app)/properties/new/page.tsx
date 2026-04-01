import { requireFamilyAuth } from "@/lib/auth-guard";
import { NewPropertyClient } from "./new-property-client";

export default async function NewPropertyPage() {
  await requireFamilyAuth();
  return <NewPropertyClient />;
}
