const { GraphQLUpload } = require("apollo-server-koa");

const db = require("../database");

const generateId = () => {
    return `${new Date().getTime()}`;
};

const resolvers = {
    FileUpload: GraphQLUpload,
    Query: {
        getUserDetails(parent, args) {
            // Return the User Details for the person whose ID matches the given ID
            return db.userDetails.findByPk(args.id);
        },
        getUserProfilePicture(parent, args, { db }) {
            // Get the file path for the Profile Picture of the person whose ID matches the given ID
            const filePath = db.userDetails.findByPk(
                args.id
            ).profilePictureFilePath;
            return db.get("uploads").value();
        },
        hello() {
            return "Hello World";
        },
    },
    Mutation: {
        async addUser(parent, args) {
            console.log(args);
            const details = {
                id: generateId(),
                name: args.name,
                occupation: args.occupation,
                email: args.email,
                website: args.website,
            };
            await db.userDetails.create(details);
            return details;
        },
        addProfilePicture(parent, { id, file }, { storeUpload }) {
            console.log("Called addProfilePicture");
            console.log("ID: ", id);
            console.log("File: ", file);
            return storeUpload(file);
        },
    },
};

module.exports = resolvers;
