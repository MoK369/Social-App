import type { HydratedDocument, Model } from "mongoose";
import type { IUser as TDocument } from "../interfaces/user.interface.ts";
import DatabaseRepository from "./database.repository.ts";
import type { ProjectionType } from "mongoose";
import type { QueryOptions } from "mongoose";

class UserRepository extends DatabaseRepository<TDocument> {
  constructor(UserModel: Model<TDocument>) {
    super(UserModel);
  }

  findByEmail = async ({
    email,
    projection,
    options,
  }: {
    email: string;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findOne({ email }, projection, options);
  };
}

export default UserRepository;
