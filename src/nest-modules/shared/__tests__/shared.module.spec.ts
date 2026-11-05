import {Test} from '@nestjs/testing';
import {SharedModule} from '@/nest-modules/shared/shared.module';
import {ConfigModule} from "@/nest-modules/config/config.module";
import {DatabaseModule} from "@/nest-modules/database/database.module";

describe('SharedModule Unit Tests', () => {
	it('should compile', async () => {
		const module = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule]
		}).compile();

		expect(module.get(SharedModule)).toBeInstanceOf(SharedModule);
	});
});
