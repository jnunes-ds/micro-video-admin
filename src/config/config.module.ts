import { Module } from '@nestjs/common';
import {ConfigModule as NestConfigModule, ConfigModuleOptions} from '@nestjs/config';
import {join} from "path";
import {z} from "zod";

export const validationSchema = z.intersection(
	z.object({
		DB_VENDOR: z.string().superRefine((val, ctx) => {
			if (val && val !== 'mysql' && val !== 'sqlite') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid option: expected one of "mysql"|"sqlite"',
				});
				return z.NEVER;
			}
		}),
		DB_HOST: z.string(),
		DB_DATABASE: z.string().optional(),
		DB_USERNAME: z.string().optional(),
		DB_PASSWORD: z.string().optional(),
		DB_PORT: z.coerce.number().optional(),
		DB_LOGGING: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
		DB_AUTO_LOAD_MODELS: z.any()
			.superRefine((val, ctx) => {
				if (val === undefined) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'DB_AUTO_LOAD_MODELS is required',
					});
					return z.NEVER;
				}
				if (val !== 'true' && val !== true && val !== 'false' && val !== false) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'DB_AUTO_LOAD_MODELS must be a boolean',
					});
					return z.NEVER;
				}
			})
			.transform(val => val === 'true' || val === true),
	}),
	z.object({
		DB_VENDOR: z.any().optional(),
		DB_DATABASE: z.any().optional(),
		DB_USERNAME: z.any().optional(),
		DB_PASSWORD: z.any().optional(),
		DB_PORT: z.any().optional(),
	}).superRefine((data, ctx) => {
		if (!data.DB_VENDOR) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['DB_VENDOR'],
				message: 'DB_VENDOR is required'
			});
		}

		if (data.DB_VENDOR === 'mysql') {
			const requiredFields = ['DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'DB_PORT'] as const;
			for (const field of requiredFields) {
				if (!data[field] || data[field] === '' || data[field] === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: [field],
						message: `${field} is required when DB_VENDOR is mysql`
					});
				}
			}
		}
		return z.NEVER;
	})
);

type ValidationSchemaType = z.infer<typeof validationSchema>;
export type CONFIG_SCHEMA_TYPE = ValidationSchemaType & { DB_VENDOR: 'mysql' | 'sqlite' };

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
			validate: (env) => {
				const result = validationSchema.safeParse(env);
				if (!result.success) {
					throw new Error(
						`Config validation error: ${JSON.stringify(result.error.format(), null, 2)}`,
					);
				}
				return result.data;
			},
			...otherOptions
		})
	}
}
