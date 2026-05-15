import TaxonomyAdmin from "../_components/TaxonomyAdmin";

export const metadata = { title: "Collections" };

export default function AdminCollectionsPage() {
  return (
    <TaxonomyAdmin kind="collections" singular="Collection" plural="Collections" />
  );
}
