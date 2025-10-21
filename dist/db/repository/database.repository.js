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
}
export default DatabaseRepository;
