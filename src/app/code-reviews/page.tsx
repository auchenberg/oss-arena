import { ReviewsData } from "@/lib/types";
import reviewsData from "../../../data/reviews.json";
import { CodeReviewsClient } from "@/components/CodeReviewsClient";

export default function CodeReviews() {
  const reviews = reviewsData as ReviewsData;

  return <CodeReviewsClient reviews={reviews} />;
}
