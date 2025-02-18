import { Database } from "./supabase";

export type ProceedingPointWithRelations =
  Database["public"]["Tables"]["proceeding_point_ai"]["Row"] & {
    proceeding_day: Database["public"]["Tables"]["proceeding_day"]["Row"] & {
      proceeding: Database["public"]["Tables"]["proceeding"]["Row"];
    };
  };
