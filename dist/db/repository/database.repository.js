class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    create = async ({ data, options = {
        validateBeforeSave: true,
    }, }) => {
        return this.model.create(data, options);
    };
    find = async ({ filter, projection, options = {}, }) => {
        return this.model.find(filter, projection, options);
    };
    paginate = async ({ filter, projection, options = {}, page = "all", size, }) => {
        let docsCount;
        let totalPages;
        if (page !== "all") {
            page = Math.floor(!page || page < 1 ? 1 : page);
            options.limit = Math.floor(!size || size < 1 ? 5 : size);
            options.skip = (page - 1) * size;
            docsCount = await this.model.countDocuments(filter);
            totalPages = Math.ceil(docsCount / size);
        }
        const data = await this.model.find(filter, projection, options);
        return {
            docsCount,
            totalPages,
            currentPage: page !== "all" ? page : undefined,
            size: page !== "all" ? size : undefined,
            data: data,
        };
    };
    findOne = async ({ filter, projection, options = {}, }) => {
        return this.model.findOne(filter, projection, options);
    };
    findById = async ({ id, projection, options = {}, }) => {
        return this.model.findById(id, projection, options);
    };
    updateOne = async ({ filter = {}, update, options = {}, }) => {
        return this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    };
    updateById = async ({ id, update, options = {}, }) => {
        let toUpdateObject;
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: ["$__v", 1] },
                },
            });
            toUpdateObject = update;
        }
        else {
            toUpdateObject = { ...update, $inc: { __v: 1 } };
        }
        return this.model.updateOne({ _id: id }, toUpdateObject, options);
    };
    findOneAndUpdate = async ({ filter = {}, update, options = { new: true }, }) => {
        return this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    };
    findByIdAndUpdate = async ({ id, update, options = { new: true }, }) => {
        return this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options);
    };
    deleteOne = async ({ filter = {}, options = {}, }) => {
        return this.model.deleteOne(filter, options);
    };
    findOneAndDelete = async ({ filter = {}, options = { new: true }, }) => {
        return this.model.findOneAndDelete(filter, options);
    };
}
export default DatabaseRepository;
