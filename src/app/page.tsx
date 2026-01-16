import { getHistoryData } from '@/lib/data';
import { ContributionsData, ReviewsData } from '@/lib/types';
import contributionsData from '../../data/contributions.json';
import reviewsData from '../../data/reviews.json';
import { HomeClient } from '@/components/HomeClient';

export default function Home() {
  const contributions = contributionsData as ContributionsData;
  const reviews = reviewsData as ReviewsData;
  const historyData = getHistoryData();

  return (
    <HomeClient
      contributions={contributions}
      reviews={reviews}
      historyData={historyData}
    />
  );
}
