import Questions from "@/pages/Questions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function QuestionsPage({ params }: Props) {
  const { id } = await params;
  return <Questions categoryId={id} />;
}
