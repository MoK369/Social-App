import type { UpdateWriteOpResult } from "mongoose";
import type {
  HydratedDocument,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
} from "mongoose";
import type { CreateOptions, Model } from "mongoose";

abstract class DatabaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  findOne = async ({
    filter,
    projection,
    options = {},
  }: {
    filter?: RootFilterQuery<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findOne(filter, projection, options);
  };

  findById = async ({
    id,
    projection,
    options = {},
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findById(id, projection, options);
  };

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

  updateOne = async ({
    filter = {},
    update,
    options = {},
  }: {
    filter?: RootFilterQuery<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument>;
  }): Promise<UpdateWriteOpResult> => {
    return this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options
    );
  };
}

export default DatabaseRepository;
