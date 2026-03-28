import { Module } from '@nestjs/common';
import {ConfigModule as NestConfigModule, ConfigModuleOptions} from '@nestjs/config';
import {join} from "path";
import {z} from "zod";

export const validationSchema = z.object({
	DB_VENDOR: z.enum(['mysql', 'sqlite']),
	DB_HOST: z.string().min(1),
	DB_DATABASE: z.string().optional(),
	DB_USERNAME: z.string().optional(),
	DB_PASSWORD: z.string().optional(),
	DB_PORT: z.coerce.number().optional(),
	DB_LOGGING: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
	DB_AUTO_LOAD_MODELS: z.preprocess((val) => {
		if (val === 'true' || val === true) return true;
		if (val === 'false' || val === false) return false;
		return val;
	}, z.boolean({ error: 'DB_AUTO_LOAD_MODELS is required' }))
}).superRefine((data, ctx) => {
	if (data.DB_VENDOR === 'mysql') {
		const requiredFields = ['DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'DB_PORT'] as const;
		for (const field of requiredFields) {
			if (!data[field]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: [field],
					message: `${field} is required when DB_VENDOR is mysql`
				});
			}
		}
	}
});

type ValidationSchemaType = z.infer<typeof validationSchema>;

@Module({})
export class ConfigModule extends NestConfigModule {
	static forRoot(options: ConfigModuleOptions = {}) {
		const {envFilePath, ...otherOptions} = options;

		return super.forRoot({
			isGlobal: true,
			envFilePath: [
				...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
				join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
				join(process.cwd(), 'envs', `.env`),
			],
			validate: (env) => validationSchema.parse(env),
			...otherOptions
		})
	}
}
