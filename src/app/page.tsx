import { getHistoryData } from "@/lib/data";
import { ContributionsData } from "@/lib/types";
import contributionsData from "../../data/contributions.json";
import { HomeClient } from "@/components/HomeClient";

export default function Home() {
  const contributions = contributionsData as ContributionsData;
  const historyData = getHistoryData();

  return <HomeClient contributions={contributions} historyData={historyData} />;
}
