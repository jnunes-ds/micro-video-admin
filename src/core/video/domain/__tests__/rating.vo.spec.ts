import {InvalidRatingError, Rating, RatingValues} from "@core/video/domain/rating.vo";

describe('Rating Unit Tests', () => {
	it('should throw an InvalidRatingError when RatingValue is not valid', () => {
		const [rating, error] = Rating.create('batata' as never);

		expect(rating).toBeNull();
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(InvalidRatingError);
	});

	it('should create a Rating normally', () => {
		const [rating, error] = Rating.create(RatingValues.R12);

		expect(error).toBeNull();
		expect(rating).toBeDefined();
		// @ts-expect-error
		expect(rating['value']).toBe('12');
	});
});