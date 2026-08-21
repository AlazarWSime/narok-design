import type { Metadata } from "next";
import InnerPage from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Collection | NAROK DESIGN",
  description: "Explore NAROK DESIGN collections for women, men and children, created in Addis Ababa.",
};

export default function CollectionPage() {
  return <InnerPage kind="collection" />;
}
