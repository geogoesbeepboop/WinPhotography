import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { GalleriesModule } from './modules/galleries/galleries.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PackagesModule } from './modules/packages/packages.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        join(__dirname, '..', '..', '..', '.env'),  // monorepo root
        join(__dirname, '..', '.env'),                // apps/api/.env (if exists)
        '.env',                                       // CWD fallback
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Always use migrations in production
      // Supabase requires SSL even in development
      ssl: process.env.DATABASE_URL?.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    HealthModule,
    AuthModule,
    UsersModule,
    InquiriesModule,
    BookingsModule,
    GalleriesModule,
    PortfolioModule,
    PaymentsModule,
    PackagesModule,
    TestimonialsModule,
    StorageModule,
    EmailModule,
  ],
})
export class AppModule {}
