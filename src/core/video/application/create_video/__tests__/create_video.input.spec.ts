import {CreateVideoInput, ValidateCreateVideoInput} from "@core/video/application/create_video/create_video.input";
import {RatingValues} from "@core/video/domain/rating.vo";

function makeValidProps() {
	return {
		title: 'Movie title',
		description: 'Movie description',
		year_launched: 2020,
		duration: 90,
		rating: RatingValues.R14,
		is_opened: true,
		categories_id: ['5490020a-e866-4229-9adc-aa44b83234c4'],
		genres_id: ['5490020a-e866-4229-9adc-aa44b83234c4'],
		cast_members_id: ['5490020a-e866-4229-9adc-aa44b83234c4'],
	};
}

describe('CreateVideoInput', () => {
	it('should assign all the props when the constructor receives them', () => {
		const props = makeValidProps();
		const input = new CreateVideoInput(props);

		expect(input).toMatchObject(props);
	});

	it('should not assign any prop when the constructor does not receive props', () => {
		const input = new CreateVideoInput();

		expect(input).toEqual(new CreateVideoInput());
	});
});

describe('ValidateCreateVideoInput', () => {
	it('should return no errors when the input is valid', () => {
		const input = new CreateVideoInput(makeValidProps());

		const errors = ValidateCreateVideoInput.validate(input);

		expect(errors.length).toBe(0);
	});

	it('should return an error when title is empty', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), title: '' });

		const errors = ValidateCreateVideoInput.validate(input);

		const titleErrors = errors.find((error) => error.property === 'title');
		expect(titleErrors).toBeDefined();
		expect(titleErrors!.constraints).toHaveProperty('isNotEmpty');
	});

	it('should return an error when title is not a string', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), title: 123 as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const titleErrors = errors.find((error) => error.property === 'title');
		expect(titleErrors).toBeDefined();
		expect(titleErrors!.constraints).toHaveProperty('isString');
	});

	it('should return an error when description is empty', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), description: '' });

		const errors = ValidateCreateVideoInput.validate(input);

		const descriptionErrors = errors.find((error) => error.property === 'description');
		expect(descriptionErrors).toBeDefined();
		expect(descriptionErrors!.constraints).toHaveProperty('isNotEmpty');
	});

	it('should return an error when description is not a string', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), description: 123 as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const descriptionErrors = errors.find((error) => error.property === 'description');
		expect(descriptionErrors).toBeDefined();
		expect(descriptionErrors!.constraints).toHaveProperty('isString');
	});

	it('should return an error when year_launched is not an integer', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), year_launched: 2020.5 });

		const errors = ValidateCreateVideoInput.validate(input);

		const yearLaunchedErrors = errors.find((error) => error.property === 'year_launched');
		expect(yearLaunchedErrors).toBeDefined();
		expect(yearLaunchedErrors!.constraints).toHaveProperty('isInt');
	});

	it('should return an error when year_launched is lower than 1900', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), year_launched: 1899 });

		const errors = ValidateCreateVideoInput.validate(input);

		const yearLaunchedErrors = errors.find((error) => error.property === 'year_launched');
		expect(yearLaunchedErrors).toBeDefined();
		expect(yearLaunchedErrors!.constraints).toHaveProperty('min');
	});

	it('should return an error when duration is not an integer', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), duration: 90.5 });

		const errors = ValidateCreateVideoInput.validate(input);

		const durationErrors = errors.find((error) => error.property === 'duration');
		expect(durationErrors).toBeDefined();
		expect(durationErrors!.constraints).toHaveProperty('isInt');
	});

	it('should return an error when duration is lower than 1', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), duration: 0 });

		const errors = ValidateCreateVideoInput.validate(input);

		const durationErrors = errors.find((error) => error.property === 'duration');
		expect(durationErrors).toBeDefined();
		expect(durationErrors!.constraints).toHaveProperty('min');
	});

	it('should return an error when rating is not a valid value', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), rating: 'invalid' as RatingValues });

		const errors = ValidateCreateVideoInput.validate(input);

		const ratingErrors = errors.find((error) => error.property === 'rating');
		expect(ratingErrors).toBeDefined();
		expect(ratingErrors!.constraints).toHaveProperty('isEnum');
	});

	it('should return an error when is_opened is not a boolean', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), is_opened: 'true' as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const isOpenedErrors = errors.find((error) => error.property === 'is_opened');
		expect(isOpenedErrors).toBeDefined();
		expect(isOpenedErrors!.constraints).toHaveProperty('isBoolean');
	});

	it('should return an error when categories_id is not an array', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), categories_id: 'not-an-array' as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const categoriesIdErrors = errors.find((error) => error.property === 'categories_id');
		expect(categoriesIdErrors).toBeDefined();
		expect(categoriesIdErrors!.constraints).toHaveProperty('isArray');
	});

	it('should return an error when categories_id contains an invalid uuid', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), categories_id: ['not-a-uuid'] });

		const errors = ValidateCreateVideoInput.validate(input);

		const categoriesIdErrors = errors.find((error) => error.property === 'categories_id');
		expect(categoriesIdErrors).toBeDefined();
		expect(categoriesIdErrors!.constraints).toHaveProperty('isUuid');
	});

	it('should return an error when genres_id is not an array', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), genres_id: 'not-an-array' as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const genresIdErrors = errors.find((error) => error.property === 'genres_id');
		expect(genresIdErrors).toBeDefined();
		expect(genresIdErrors!.constraints).toHaveProperty('isArray');
	});

	it('should return an error when genres_id contains an invalid uuid', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), genres_id: ['not-a-uuid'] });

		const errors = ValidateCreateVideoInput.validate(input);

		const genresIdErrors = errors.find((error) => error.property === 'genres_id');
		expect(genresIdErrors).toBeDefined();
		expect(genresIdErrors!.constraints).toHaveProperty('isUuid');
	});

	it('should return an error when cast_members_id is not an array', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), cast_members_id: 'not-an-array' as any });

		const errors = ValidateCreateVideoInput.validate(input);

		const castMembersIdErrors = errors.find((error) => error.property === 'cast_members_id');
		expect(castMembersIdErrors).toBeDefined();
		expect(castMembersIdErrors!.constraints).toHaveProperty('isArray');
	});

	it('should return an error when cast_members_id contains an invalid uuid', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), cast_members_id: ['not-a-uuid'] });

		const errors = ValidateCreateVideoInput.validate(input);

		const castMembersIdErrors = errors.find((error) => error.property === 'cast_members_id');
		expect(castMembersIdErrors).toBeDefined();
		expect(castMembersIdErrors!.constraints).toHaveProperty('isUuid');
	});

	it('should return multiple errors when multiple props are invalid', () => {
		const input = new CreateVideoInput({ ...makeValidProps(), title: '', description: '' });

		const errors = ValidateCreateVideoInput.validate(input);

		const invalidProperties = errors.map((error) => error.property);
		expect(invalidProperties).toEqual(expect.arrayContaining(['title', 'description']));
	});
});
