import {Test} from '@nestjs/testing';
import {SharedModule} from '@/nest-modules/shared/shared.module';

describe('SharedModule Unit Tests', () => {
	it('should compile', async () => {
		const module = await Test.createTestingModule({
			imports: [SharedModule]
		}).compile();

		expect(module.get(SharedModule)).toBeInstanceOf(SharedModule);
	});
});
