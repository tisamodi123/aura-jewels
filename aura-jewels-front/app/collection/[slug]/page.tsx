import JewelryList from '@/app/[category]/_components/JewelryList';
import { fetchServerJewelryData } from '@/lib/serverProductData';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<any>;
};

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const serverData = await fetchServerJewelryData({
    scope: 'collection',
    collectionId: slug,
    searchParams: resolvedSearchParams,
  });

  return (
    <div className="bg-white">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-stone-400 font-medium animate-pulse">Loading Collection...</div>
          </div>
        }
      >
        <JewelryList
          scope="collection"
          collectionId={slug}
          searchParams={resolvedSearchParams}
          initialProducts={serverData.initialProducts}
          initialTotalCount={serverData.initialTotalCount}
          initialAllParams={serverData.initialAllParams}
          initialStyleList={serverData.initialStyleList}
        />
      </Suspense>
    </div>
  );
}
