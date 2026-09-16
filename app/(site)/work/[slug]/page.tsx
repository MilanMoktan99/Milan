export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1 className="text-4xl p-10">Case study: {slug}</h1>;
}