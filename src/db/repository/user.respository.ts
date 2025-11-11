import type { Model } from "mongoose";
import type { IUser as TDocument } from "../interfaces/user.interface.ts";
import DatabaseRepository from "./database.repository.ts";
import type { ProjectionType } from "mongoose";
import type {
  FindFunctionOptionsType,
  FindFunctionsReturnType,
} from "../../utils/types/find_functions.type.ts";

class UserRepository extends DatabaseRepository<TDocument> {
  constructor(UserModel: Model<TDocument>) {
    super(UserModel);
  }

  findByEmail = async <TLean extends boolean = false>({
    email,
    projection,
    options,
  }: {
    email: string;
    projection?: ProjectionType<TDocument>;
    options?: FindFunctionOptionsType<TDocument, TLean>;
  }): Promise<FindFunctionsReturnType<TDocument, TLean>> => {
    return this.model.findOne({ email }, projection, options);
  };
}

export default UserRepository;
