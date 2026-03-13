
import { Star, StarHalfIcon } from "lucide-react";
import React, { FC } from "react";

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={`star-${i}`} className="bg-yellow-300"/>);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<StarHalfIcon key={`half-${i}`} />);
    } else {
      stars.push(<Star key={`empty-${i}`} />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;
