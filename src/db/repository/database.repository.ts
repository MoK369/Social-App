import type { HydratedDocument } from "mongoose";
import type { CreateOptions, Model } from "mongoose";

abstract class DatabaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  create = async ({
    data,
    options = {
      validateBeforeSave: true,
    },
  }: {
    data: Partial<TDocument>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TDocument>[]> => {
    return this.model.create(data, options);
  };
}

export default DatabaseRepository;
