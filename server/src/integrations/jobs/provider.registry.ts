import { JobSourceProvider } from "./types/job-source.types";
import { JoobleProvider } from "./providers/jooble/jooble.provider";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private readonly providers: Map<string, JobSourceProvider> = new Map();

  private constructor() {
    // Register default Jooble provider
    const defaultJooble = new JoobleProvider();
    this.registerProvider(defaultJooble);
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  registerProvider(provider: JobSourceProvider): void {
    this.providers.set(provider.provider.toLowerCase(), provider);
  }

  getProvider(providerName: string): JobSourceProvider {
    const key = providerName.toLowerCase();
    const provider = this.providers.get(key);

    if (!provider) {
      throw new AppError(
        `Job source provider '${providerName}' is not registered`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_JOB_PROVIDER
      );
    }

    return provider;
  }

  hasProvider(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase());
  }

  getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
