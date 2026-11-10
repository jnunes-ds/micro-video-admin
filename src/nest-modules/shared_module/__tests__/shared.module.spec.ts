import {Test} from '@nestjs/testing';
import {SharedModule} from '@/nest-modules/shared_module/shared.module';
import {ConfigModule} from "@/nest-modules/config_module/config.module";
import {DatabaseModule} from "@/nest-modules/database_module/database.module";

describe('SharedModule Unit Tests', () => {
	it('should compile', async () => {
		const module = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule]
		}).compile();

		expect(module.get(SharedModule)).toBeInstanceOf(SharedModule);
	});
});
