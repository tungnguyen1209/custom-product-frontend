import PostForm from "../../_components/PostForm";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return <PostForm initial={null} />;
}
