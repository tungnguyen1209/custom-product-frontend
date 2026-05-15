import TaxonomyAdmin from "../_components/TaxonomyAdmin";

export const metadata = { title: "Tags" };

export default function AdminTagsPage() {
  return <TaxonomyAdmin kind="tags" singular="Tag" plural="Tags" />;
}
