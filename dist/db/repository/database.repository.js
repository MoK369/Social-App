class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    findOne = async ({ filter, projection, options = {}, }) => {
        return this.model.findOne(filter, projection, options);
    };
    findById = async ({ id, projection, options = {}, }) => {
        return this.model.findById(id, projection, options);
    };
    create = async ({ data, options = {
        validateBeforeSave: true,
    }, }) => {
        return this.model.create(data, options);
    };
    updateOne = async ({ filter = {}, update, options = {}, }) => {
        return this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    };
    updateById = async ({ id, update, options = {}, }) => {
        return this.model.updateOne({ _id: id }, { ...update, $inc: { __v: 1 } }, options);
    };
    findOneAndUpdate = async ({ filter = {}, update, options = { new: true }, }) => {
        return this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    };
    findByIdAndUpdate = async ({ id, update, options = { new: true }, }) => {
        return this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options);
    };
}
export default DatabaseRepository;
